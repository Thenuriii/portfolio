import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Cache for rate limiter instances keyed by "limit:windowMs"
const limiters = new Map<string, Ratelimit>();

/**
 * Checks the IP-based rate limit for the given request.
 * Builds or retrieves a cached Ratelimit instance using slidingWindow.
 * Keyed by x-forwarded-for header, falling back to x-real-ip, then "unknown_ip".
 *
 * @param req The incoming Request object
 * @param limit The maximum number of allowed requests in the window
 * @param windowMs The window duration in milliseconds
 * @returns NextResponse (429 status) if rate limit is exceeded, or null if allowed
 */
export async function checkRateLimit(
  req: Request,
  limit: number,
  windowMs: number
): Promise<NextResponse | null> {
  const cacheKey = `${limit}:${windowMs}`;
  let limiter = limiters.get(cacheKey);

  if (!limiter) {
    // Convert windowMs to seconds string, e.g. "60 s"
    const windowSeconds = Math.ceil(windowMs / 1000);
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      analytics: true,
      prefix: "@upstash/ratelimit",
    });
    limiters.set(cacheKey, limiter);
  }

  // Extract client IP address
  // Fall back sequence: x-forwarded-for -> x-real-ip -> "unknown_ip"
  const xForwardedFor = req.headers.get("x-forwarded-for");
  let ip = "unknown_ip";
  if (xForwardedFor) {
    ip = xForwardedFor.split(",")[0].trim();
  } else {
    ip = req.headers.get("x-real-ip") || "unknown_ip";
  }

  try {
    const { success } = await limiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        { status: 429 }
      );
    }
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Fail open in case Upstash Redis is down/misconfigured so as not to block admin operations.
    return null;
  }

  return null;
}

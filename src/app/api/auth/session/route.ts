import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Rate-limit POST requests to prevent brute force (10 requests per 60 seconds)
  const rateLimitResponse = await checkRateLimit(request, 10, 60 * 1000);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json(
        { error: "Missing ID token" },
        { status: 400 }
      );
    }

    // 2. Verify the Firebase ID token
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    
    // 3. Verify the user's email is allowed
    const allowedEmail = process.env.STUDIO_ALLOWED_EMAIL;
    if (!allowedEmail || decoded.email !== allowedEmail) {
      return NextResponse.json(
        { error: "Unauthorized: Email not allowed inside admin panel" },
        { status: 401 }
      );
    }

    // 4. Create the session cookie (expires in 5 days)
    const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn,
    });

    // 5. Set the session cookie via next/headers
    const cookieStore = await cookies();
    cookieStore.set("studio_session", sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000, // maxAge is in seconds
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function DELETE(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    // Clear the session cookie
    cookieStore.set("studio_session", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Session deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to destroy session" },
      { status: 500 }
    );
  }
}

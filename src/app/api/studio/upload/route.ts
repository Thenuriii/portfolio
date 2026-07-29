import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { requireAuth } from "@/lib/authMiddleware";

export async function POST(request: Request): Promise<NextResponse> {
  // Rate limit check: 15 requests per 60 seconds (60000ms) for upload
  const rateLimitResponse = await checkRateLimit(request, 15, 60000);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Verify authentication using Authorization Bearer header
    await requireAuth(request);

    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml",
            "application/pdf",
            "video/mp4",
            "video/webm",
            "video/quicktime",
          ],
          token: process.env.BLOB_READ_WRITE_TOKEN,
          clientPayload,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Blob upload completed:", blob);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate upload token" },
      { status: error.message?.includes("Unauthorized") ? 401 : 400 }
    );
  }
}

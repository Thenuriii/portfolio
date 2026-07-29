import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import type { PutBlobResult } from "@vercel/blob";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request: Request): Promise<NextResponse> {
  // Rate limit check: 20 requests per 60 seconds (60000ms)
  const rateLimitResponse = await checkRateLimit(request, 20, 60000);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
        // In the next phase, we can check auth session here.
        // For now, allow uploads for the admin user.
        const requestUrl = new URL(request.url);
        const isLocalhost = requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1";
        const callbackUrl = isLocalhost
          ? `${requestUrl.origin}/api/studio/upload`
          : undefined;

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
          callbackUrl,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }: { blob: PutBlobResult; tokenPayload?: string | null }) => {
        // Runs server-side when the file upload completes
        console.log("Blob upload completed:", blob);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

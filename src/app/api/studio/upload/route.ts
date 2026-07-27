import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // In the next phase, we can check auth session here.
        // For now, allow uploads for the admin user.
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
      onUploadCompleted: async ({ blob, tokenPayload }) => {
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

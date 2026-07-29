import { get } from "@vercel/blob";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const blobUrl = searchParams.get("url");

    if (!blobUrl) {
      return new Response("Missing url query parameter", { status: 400 });
    }

    // Security check to avoid open SSRF vulnerabilities
    if (!blobUrl.includes("blob.vercel-storage.com")) {
      return new Response("Invalid blob URL", { status: 400 });
    }

    // Fetch the private blob stream using our read/write token
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error("BLOB_READ_WRITE_TOKEN is missing in process.env");
      return new Response("Vercel Blob store credentials (BLOB_READ_WRITE_TOKEN) are missing on the server. Please add them in your Vercel Project Environment Variables.", { status: 500 });
    }

    const result = await get(blobUrl, {
      access: "private",
      token,
    });

    if (!result) {
      return new Response("Blob asset not found", { status: 404 });
    }

    const { stream, blob } = result;

    // Stream the response back to the client browser
    return new Response(stream, {
      headers: {
        "Content-Type": blob.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Error proxying private Vercel Blob:", error);
    return new Response(error.message || "Failed to retrieve private blob asset", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/authMiddleware";
import { checkRateLimit } from "@/lib/rateLimit";
import { deleteBlobAssets } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const rateLimitResponse = await checkRateLimit(request, 20, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    await requireAuth(request);
    const body = await request.json();
    const { action, id, data } = body;

    // 1. Bulk Delete All
    if (action === "deleteAll") {
      const allCerts = await sql`SELECT image_url FROM certificates`;
      await deleteBlobAssets(allCerts.map(c => c.image_url));
      await sql`DELETE FROM certificates`;
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 2. Delete Single
    if (action === "delete") {
      if (!id) return NextResponse.json({ error: "Missing certificate ID" }, { status: 400 });
      const oldCerts = await sql`SELECT image_url FROM certificates WHERE id = ${id}`;
      const cert = oldCerts[0];
      if (cert) {
        await deleteBlobAssets([cert.image_url]);
      }
      await sql`DELETE FROM certificates WHERE id = ${id}`;
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 3. Upsert
    if (!data) return NextResponse.json({ error: "Missing certificate data" }, { status: 400 });
    const { title, issued_by, image_url } = data;
    if (!title || !issued_by) {
      return NextResponse.json({ error: "Title and Issued By are required." }, { status: 400 });
    }

    const targetId = id || crypto.randomUUID();
    let isUpdate = false;
    if (id) {
      const existing = await sql`SELECT id FROM certificates WHERE id = ${id}`;
      if (existing.length > 0) isUpdate = true;
    }

    if (isUpdate) {
      // Check if image url changed to delete old Vercel Blob
      const old = await sql`SELECT image_url FROM certificates WHERE id = ${targetId}`;
      if (old[0] && old[0].image_url !== image_url) {
        await deleteBlobAssets([old[0].image_url]);
      }

      await sql`
        UPDATE certificates
        SET title = ${title},
            issued_by = ${issued_by},
            image_url = ${image_url}
        WHERE id = ${targetId}
      `;
    } else {
      await sql`
        INSERT INTO certificates (id, title, issued_by, image_url, created_at)
        VALUES (${targetId}, ${title}, ${issued_by}, ${image_url}, NOW())
      `;
    }

    revalidatePaths();
    return NextResponse.json({ success: true, id: targetId });
  } catch (error: any) {
    console.error("Error in certificate API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save certificate" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

function revalidatePaths() {
  revalidatePath("/about");
  revalidatePath("/admin/dashboard");
}

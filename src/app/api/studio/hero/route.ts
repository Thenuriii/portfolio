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
    const { action, data } = body;

    const currentRows = await sql`SELECT * FROM hero_data LIMIT 1`;
    const existing = currentRows[0];

    // 1. Delete Profile Image Asset
    if (action === "deleteProfileImage") {
      if (existing && existing.profile_image_url) {
        await deleteBlobAssets([existing.profile_image_url]);
        await sql`UPDATE hero_data SET profile_image_url = '' WHERE id = ${existing.id}`;
      }
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 2. Delete CV Document Asset
    if (action === "deleteCV") {
      if (existing && existing.cv_url) {
        await deleteBlobAssets([existing.cv_url]);
        await sql`UPDATE hero_data SET cv_url = '' WHERE id = ${existing.id}`;
      }
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 3. Upsert Hero Data
    if (!data) return NextResponse.json({ error: "Missing hero data" }, { status: 400 });
    const { job_status, profile_image_url = "", cv_url = "" } = data;
    if (!job_status) return NextResponse.json({ error: "Job status is required." }, { status: 400 });

    if (existing) {
      const urlsToDelete = [];
      if (existing.profile_image_url && existing.profile_image_url !== profile_image_url) {
        urlsToDelete.push(existing.profile_image_url);
      }
      if (existing.cv_url && existing.cv_url !== cv_url) {
        urlsToDelete.push(existing.cv_url);
      }
      await deleteBlobAssets(urlsToDelete);

      await sql`
        UPDATE hero_data
        SET job_status = ${job_status},
            profile_image_url = ${profile_image_url},
            cv_url = ${cv_url},
            updated_at = NOW()
        WHERE id = ${existing.id}
      `;
    } else {
      await sql`
        INSERT INTO hero_data (id, job_status, profile_image_url, cv_url, updated_at)
        VALUES (${crypto.randomUUID()}, ${job_status}, ${profile_image_url}, ${cv_url}, NOW())
      `;
    }

    revalidatePaths();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in hero API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save hero settings" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

function revalidatePaths() {
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
}

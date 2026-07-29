import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/authMiddleware";
import { checkRateLimit } from "@/lib/rateLimit";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const rateLimitResponse = await checkRateLimit(request, 20, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    await requireAuth(request);
    const body = await request.json();
    const { action, id, type, data } = body;

    // 1. Bulk Delete All
    if (action === "deleteAll") {
      await sql`DELETE FROM education`;
      await sql`DELETE FROM core_curriculum`;
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 2. Delete Education Item
    if (action === "delete" || action === "deleteEducation") {
      if (!id) return NextResponse.json({ error: "Missing education item ID" }, { status: 400 });
      await sql`DELETE FROM education WHERE id = ${id}`;
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 3. Delete Curriculum Item
    if (action === "deleteCurriculum") {
      if (!id) return NextResponse.json({ error: "Missing curriculum item ID" }, { status: 400 });
      await sql`DELETE FROM core_curriculum WHERE id = ${id}`;
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 4. Upsert Education Item
    if (type === "education") {
      if (!data) return NextResponse.json({ error: "Missing education data" }, { status: 400 });
      const { degree, institution, order = 0 } = data;
      if (!degree || !institution) {
        return NextResponse.json({ error: "Degree and Institution are required." }, { status: 400 });
      }

      const targetId = id || crypto.randomUUID();
      let isUpdate = false;
      if (id) {
        const existing = await sql`SELECT id FROM education WHERE id = ${id}`;
        if (existing.length > 0) isUpdate = true;
      }

      if (isUpdate) {
        await sql`
          UPDATE education
          SET degree = ${degree},
              institution = ${institution},
              "order" = ${order}
          WHERE id = ${targetId}
        `;
      } else {
        await sql`
          INSERT INTO education (id, degree, institution, "order")
          VALUES (${targetId}, ${degree}, ${institution}, ${order})
        `;
      }

      revalidatePaths();
      return NextResponse.json({ success: true, id: targetId });
    }

    // 5. Upsert Curriculum Item
    if (type === "curriculum") {
      if (!data) return NextResponse.json({ error: "Missing curriculum data" }, { status: 400 });
      const { title, description, order = 0 } = data;
      if (!title || !description) {
        return NextResponse.json({ error: "Title and Description are required." }, { status: 400 });
      }

      const targetId = id || crypto.randomUUID();
      let isUpdate = false;
      if (id) {
        const existing = await sql`SELECT id FROM core_curriculum WHERE id = ${id}`;
        if (existing.length > 0) isUpdate = true;
      }

      if (isUpdate) {
        await sql`
          UPDATE core_curriculum
          SET title = ${title},
              description = ${description},
              "order" = ${order},
              updated_at = NOW()
          WHERE id = ${targetId}
        `;
      } else {
        await sql`
          INSERT INTO core_curriculum (id, title, description, "order", created_at, updated_at)
          VALUES (${targetId}, ${title}, ${description}, ${order}, NOW(), NOW())
        `;
      }

      revalidatePaths();
      return NextResponse.json({ success: true, id: targetId });
    }

    // 6. Reorder Education Items
    if (type === "reorderEducation") {
      if (!data || !Array.isArray(data)) {
        return NextResponse.json({ error: "Missing data array for reordering" }, { status: 400 });
      }
      for (const item of data) {
        await sql`
          UPDATE education
          SET "order" = ${item.order}
          WHERE id = ${item.id}
        `;
      }
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 7. Reorder Curriculum Items
    if (type === "reorderCurriculum") {
      if (!data || !Array.isArray(data)) {
        return NextResponse.json({ error: "Missing data array for reordering" }, { status: 400 });
      }
      for (const item of data) {
        await sql`
          UPDATE core_curriculum
          SET "order" = ${item.order},
              updated_at = NOW()
          WHERE id = ${item.id}
        `;
      }
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action or type" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in education API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save education details" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

function revalidatePaths() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/dashboard");
}

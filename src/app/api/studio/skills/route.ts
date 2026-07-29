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
      await sql`DELETE FROM skill_items`;
      await sql`DELETE FROM skill_categories`;
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 2. Delete Category (or single item)
    if (action === "delete" || action === "deleteCategory") {
      if (!id) {
        return NextResponse.json({ error: "Missing category id" }, { status: 400 });
      }
      await sql`DELETE FROM skill_items WHERE category_id = ${id}`;
      await sql`DELETE FROM skill_categories WHERE id = ${id}`;
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 3. Delete Skill Item
    if (action === "deleteSkillItem" || action === "deleteItem") {
      if (!id) {
        return NextResponse.json({ error: "Missing item id" }, { status: 400 });
      }
      await sql`DELETE FROM skill_items WHERE id = ${id}`;
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 4. Upsert Category
    if (type === "category") {
      if (!data) return NextResponse.json({ error: "Missing category data" }, { status: 400 });
      const { title, icon, featured = false, size = 1 } = data;
      if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });

      const targetId = id || crypto.randomUUID();
      let isUpdate = false;
      if (id) {
        const existing = await sql`SELECT id FROM skill_categories WHERE id = ${id}`;
        if (existing.length > 0) isUpdate = true;
      } else {
        const existing = await sql`SELECT id FROM skill_categories WHERE title = ${title}`;
        if (existing.length > 0) isUpdate = true;
      }

      if (isUpdate) {
        await sql`
          UPDATE skill_categories
          SET title = ${title},
              icon = ${icon},
              featured = ${featured},
              size = ${size},
              updated_at = NOW()
          WHERE id = ${targetId}
        `;
      } else {
        await sql`
          INSERT INTO skill_categories (id, title, icon, featured, size, created_at, updated_at)
          VALUES (${targetId}, ${title}, ${icon}, ${featured}, ${size}, NOW(), NOW())
        `;
      }

      revalidatePaths();
      return NextResponse.json({ success: true, id: targetId });
    }

    // 5. Upsert Skill Item
    if (type === "item") {
      if (!data) return NextResponse.json({ error: "Missing skill item data" }, { status: 400 });
      const { category_id, name } = data;
      if (!category_id || !name) {
        return NextResponse.json({ error: "Category ID and Name are required." }, { status: 400 });
      }

      const targetId = id || crypto.randomUUID();
      let isUpdate = false;
      if (id) {
        const existing = await sql`SELECT id FROM skill_items WHERE id = ${id}`;
        if (existing.length > 0) isUpdate = true;
      }

      if (isUpdate) {
        await sql`
          UPDATE skill_items
          SET name = ${name}
          WHERE id = ${targetId}
        `;
      } else {
        await sql`
          INSERT INTO skill_items (id, category_id, name)
          VALUES (${targetId}, ${category_id}, ${name})
        `;
      }

      revalidatePaths();
      return NextResponse.json({ success: true, id: targetId });
    }

    return NextResponse.json({ error: "Invalid action or type" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in skills API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save skill details" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

function revalidatePaths() {
  revalidatePath("/");
  revalidatePath("/skills");
  revalidatePath("/admin/dashboard");
}

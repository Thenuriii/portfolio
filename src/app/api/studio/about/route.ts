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
      await sql`DELETE FROM about_stats`;
      await sql`DELETE FROM core_tech_stack`;
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 2. Delete Stat
    if (action === "delete" || action === "deleteStat") {
      if (!id) return NextResponse.json({ error: "Missing stat ID" }, { status: 400 });
      await sql`DELETE FROM about_stats WHERE id = ${id}`;
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 3. Delete Tech Item
    if (action === "deleteTech") {
      if (!id) return NextResponse.json({ error: "Missing tech item ID" }, { status: 400 });
      await sql`DELETE FROM core_tech_stack WHERE id = ${id}`;
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 4. Upsert Stat
    if (type === "stat") {
      if (!data) return NextResponse.json({ error: "Missing stat data" }, { status: 400 });
      const { value, label, color = "purple", order = 0 } = data;
      if (!value || !label) {
        return NextResponse.json({ error: "Value and Label are required." }, { status: 400 });
      }

      const targetId = id || crypto.randomUUID();
      let isUpdate = false;
      if (id) {
        const existing = await sql`SELECT id FROM about_stats WHERE id = ${id}`;
        if (existing.length > 0) isUpdate = true;
      }

      if (isUpdate) {
        await sql`
          UPDATE about_stats
          SET value = ${value},
              label = ${label},
              color = ${color},
              "order" = ${order},
              updated_at = NOW()
          WHERE id = ${targetId}
        `;
      } else {
        await sql`
          INSERT INTO about_stats (id, value, label, color, "order", created_at, updated_at)
          VALUES (${targetId}, ${value}, ${label}, ${color}, ${order}, NOW(), NOW())
        `;
      }

      revalidatePaths();
      return NextResponse.json({ success: true, id: targetId });
    }

    // 5. Upsert Tech Item
    if (type === "tech") {
      if (!data) return NextResponse.json({ error: "Missing tech data" }, { status: 400 });
      const { name, order = 0 } = data;
      if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

      const targetId = id || crypto.randomUUID();
      let isUpdate = false;
      if (id) {
        const existing = await sql`SELECT id FROM core_tech_stack WHERE id = ${id}`;
        if (existing.length > 0) isUpdate = true;
      }

      if (isUpdate) {
        await sql`
          UPDATE core_tech_stack
          SET name = ${name},
              "order" = ${order},
              updated_at = NOW()
          WHERE id = ${targetId}
        `;
      } else {
        await sql`
          INSERT INTO core_tech_stack (id, name, "order", created_at, updated_at)
          VALUES (${targetId}, ${name}, ${order}, NOW(), NOW())
        `;
      }

      revalidatePaths();
      return NextResponse.json({ success: true, id: targetId });
    }

    // 6. Reorder Tech Items
    if (type === "reorderTech") {
      if (!data || !Array.isArray(data)) {
        return NextResponse.json({ error: "Missing tech array for reordering" }, { status: 400 });
      }
      for (const item of data) {
        await sql`
          UPDATE core_tech_stack
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
    console.error("Error in about stats API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save about details" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

function revalidatePaths() {
  revalidatePath("/about");
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
}

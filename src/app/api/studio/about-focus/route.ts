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
    const { action, id, data } = body;

    // 1. Bulk Delete All
    if (action === "deleteAll") {
      await sql`DELETE FROM about_focus`;
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 2. Delete Single
    if (action === "delete") {
      if (!id) return NextResponse.json({ error: "Missing focus item ID" }, { status: 400 });
      await sql`DELETE FROM about_focus WHERE id = ${id}`;
      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 3. Upsert Focus Item
    if (!data) return NextResponse.json({ error: "Missing focus data" }, { status: 400 });
    const { item, order = 0 } = data;
    if (!item) return NextResponse.json({ error: "Focus text is required." }, { status: 400 });

    const targetId = id || crypto.randomUUID();
    let isUpdate = false;
    if (id) {
      const existing = await sql`SELECT id FROM about_focus WHERE id = ${id}`;
      if (existing.length > 0) isUpdate = true;
    }

    if (isUpdate) {
      await sql`
        UPDATE about_focus
        SET item = ${item},
            "order" = ${order}
        WHERE id = ${targetId}
      `;
    } else {
      await sql`
        INSERT INTO about_focus (id, item, "order")
        VALUES (${targetId}, ${item}, ${order})
      `;
    }

    revalidatePaths();
    return NextResponse.json({ success: true, id: targetId });
  } catch (error: any) {
    console.error("Error in about focus API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save focus paragraph" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

function revalidatePaths() {
  revalidatePath("/about");
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
}

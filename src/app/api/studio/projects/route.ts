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
      // Fetch all projects to clean up their blobs
      const allProjects = await sql`SELECT image_url, video_url FROM projects`;
      const allScreenshots = await sql`SELECT image_url FROM project_screenshots`;
      
      const urlsToDelete = [
        ...allProjects.map(p => p.image_url),
        ...allProjects.map(p => p.video_url),
        ...allScreenshots.map(s => s.image_url)
      ];
      await deleteBlobAssets(urlsToDelete);

      await sql`DELETE FROM project_technologies`;
      await sql`DELETE FROM project_screenshots`;
      await sql`DELETE FROM projects`;

      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 2. Delete Single
    if (action === "delete") {
      if (!id) {
        return NextResponse.json({ error: "Missing project id" }, { status: 400 });
      }
      const oldProjects = await sql`SELECT image_url, video_url FROM projects WHERE id = ${id}`;
      const project = oldProjects[0];
      
      const oldScreenshots = await sql`SELECT image_url FROM project_screenshots WHERE project_id = ${id}`;
      
      const urlsToDelete = [];
      if (project) {
        urlsToDelete.push(project.image_url, project.video_url);
      }
      urlsToDelete.push(...oldScreenshots.map(s => s.image_url));
      
      await deleteBlobAssets(urlsToDelete);

      await sql`DELETE FROM project_technologies WHERE project_id = ${id}`;
      await sql`DELETE FROM project_screenshots WHERE project_id = ${id}`;
      await sql`DELETE FROM projects WHERE id = ${id}`;

      revalidatePaths();
      return NextResponse.json({ success: true });
    }

    // 3. Upsert (Save/Edit)
    if (!data) {
      return NextResponse.json({ error: "Missing project data" }, { status: 400 });
    }

    const {
      title,
      category,
      image_url,
      description,
      github_url,
      live_url,
      video_url,
      featured,
      order = 0,
      layout = "half",
      image_side = "left",
      tech = [],
      screenshots = []
    } = data;

    if (!title || !category) {
      return NextResponse.json({ error: "Title and Category are required." }, { status: 400 });
    }

    const targetId = id || crypto.randomUUID();

    // Check if updating an existing record
    let isUpdate = false;
    if (id) {
      const existing = await sql`SELECT id FROM projects WHERE id = ${id}`;
      if (existing.length > 0) isUpdate = true;
    } else {
      // Natural key fallback: check if title exists
      const existing = await sql`SELECT id FROM projects WHERE title = ${title}`;
      if (existing.length > 0) {
        isUpdate = true;
      }
    }

    if (isUpdate) {
      // Retrieve old media to clean up replaced Vercel Blobs
      const old = await sql`SELECT image_url, video_url FROM projects WHERE id = ${targetId}`;
      const oldProject = old[0];
      const oldScreenshots = await sql`SELECT image_url FROM project_screenshots WHERE project_id = ${targetId}`;

      const urlsToDelete = [];
      if (oldProject) {
        if (oldProject.image_url !== image_url) urlsToDelete.push(oldProject.image_url);
        if (oldProject.video_url !== video_url) urlsToDelete.push(oldProject.video_url);
      }

      // Screenshots to delete: old ones that are not in the new screenshots list
      const newScreenshotsSet = new Set(screenshots);
      for (const scr of oldScreenshots) {
        if (!newScreenshotsSet.has(scr.image_url)) {
          urlsToDelete.push(scr.image_url);
        }
      }

      await deleteBlobAssets(urlsToDelete);

      // Update
      await sql`
        UPDATE projects
        SET title = ${title},
            category = ${category},
            image_url = ${image_url},
            description = ${description},
            github_url = ${github_url},
            live_url = ${live_url},
            video_url = ${video_url},
            featured = ${featured},
            "order" = ${order},
            layout = ${layout},
            image_side = ${image_side},
            updated_at = NOW()
        WHERE id = ${targetId}
      `;
    } else {
      // Insert
      await sql`
        INSERT INTO projects (
          id, title, category, image_url, description, github_url, 
          live_url, video_url, featured, "order", layout, image_side, 
          created_at, updated_at
        ) VALUES (
          ${targetId}, ${title}, ${category}, ${image_url}, ${description}, ${github_url},
          ${live_url}, ${video_url}, ${featured}, ${order}, ${layout}, ${image_side},
          NOW(), NOW()
        )
      `;
    }

    // Refresh project technologies
    await sql`DELETE FROM project_technologies WHERE project_id = ${targetId}`;
    for (const name of tech) {
      if (name?.trim()) {
        await sql`
          INSERT INTO project_technologies (id, project_id, name)
          VALUES (${crypto.randomUUID()}, ${targetId}, ${name.trim()})
        `;
      }
    }

    // Refresh screenshots
    await sql`DELETE FROM project_screenshots WHERE project_id = ${targetId}`;
    for (let i = 0; i < screenshots.length; i++) {
      const scrUrl = screenshots[i];
      if (scrUrl?.trim()) {
        await sql`
          INSERT INTO project_screenshots (id, project_id, image_url, "order")
          VALUES (${crypto.randomUUID()}, ${targetId}, ${scrUrl.trim()}, ${i})
        `;
      }
    }

    revalidatePaths();
    return NextResponse.json({ success: true, id: targetId });
  } catch (error: any) {
    console.error("Error in projects API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save project" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

function revalidatePaths() {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/dashboard");
}

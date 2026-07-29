"use server";

import { sql } from "@/lib/db";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

// Helper function to safely delete a blob url if it's a Vercel Blob storage link
async function deleteBlobIfValid(url: string | null | undefined) {
  if (url && (url.includes("blob.vercel-storage.com") || url.startsWith("https://"))) {
    try {
      await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      console.log("Successfully deleted Vercel Blob asset:", url);
    } catch (err) {
      console.error("Failed to delete Vercel Blob asset:", url, err);
    }
  }
}

// Project Actions
export async function saveProject(project: {
  id?: string;
  title: string;
  category: string;
  image_url: string;
  description: string;
  github_url: string;
  live_url: string;
  video_url: string;
  featured: boolean;
  order: number;
  layout: string;
  image_side: string;
  tech: string[];
  screenshots: string[];
}) {
  const projectId = project.id || crypto.randomUUID();

  if (project.id) {
    // 1. Update Mode
    // Fetch old project
    const oldProjects = await sql`SELECT * FROM projects WHERE id = ${project.id}`;
    const oldProject = oldProjects[0];
    if (oldProject) {
      // If the main image changed, delete the old one
      if (oldProject.image_url !== project.image_url) {
        await deleteBlobIfValid(oldProject.image_url);
      }
    }

    // Fetch old screenshots
    const oldScreenshots = await sql`SELECT * FROM project_screenshots WHERE project_id = ${project.id}`;
    const newScreenshotsSet = new Set(project.screenshots);
    for (const oldScr of oldScreenshots) {
      if (!newScreenshotsSet.has(oldScr.image_url)) {
        await deleteBlobIfValid(oldScr.image_url);
      }
    }

    // Update Project
    await sql`
      UPDATE projects 
      SET title = ${project.title}, 
          category = ${project.category}, 
          image_url = ${project.image_url}, 
          description = ${project.description}, 
          github_url = ${project.github_url}, 
          live_url = ${project.live_url}, 
          video_url = ${project.video_url}, 
          featured = ${project.featured}, 
          "order" = ${project.order}, 
          layout = ${project.layout}, 
          image_side = ${project.image_side}, 
          updated_at = NOW() 
      WHERE id = ${project.id}
    `;

    // Clear and insert tech stack
    await sql`DELETE FROM project_technologies WHERE project_id = ${project.id}`;
    for (const name of project.tech) {
      if (name.trim()) {
        await sql`
          INSERT INTO project_technologies (id, project_id, name)
          VALUES (${crypto.randomUUID()}, ${project.id}, ${name.trim()})
        `;
      }
    }

    // Clear and insert screenshots
    await sql`DELETE FROM project_screenshots WHERE project_id = ${project.id}`;
    for (let i = 0; i < project.screenshots.length; i++) {
      const scrUrl = project.screenshots[i];
      if (scrUrl.trim()) {
        await sql`
          INSERT INTO project_screenshots (id, project_id, image_url, "order")
          VALUES (${crypto.randomUUID()}, ${project.id}, ${scrUrl.trim()}, ${i})
        `;
      }
    }
  } else {
    // 2. Insert Mode
    await sql`
      INSERT INTO projects (
        id, title, category, image_url, description, github_url, 
        live_url, video_url, featured, "order", layout, image_side, 
        created_at, updated_at
      ) VALUES (
        ${projectId}, ${project.title}, ${project.category}, ${project.image_url}, ${project.description}, ${project.github_url},
        ${project.live_url}, ${project.video_url}, ${project.featured}, ${project.order}, ${project.layout}, ${project.image_side},
        NOW(), NOW()
      )
    `;

    for (const name of project.tech) {
      if (name.trim()) {
        await sql`
          INSERT INTO project_technologies (id, project_id, name)
          VALUES (${crypto.randomUUID()}, ${projectId}, ${name.trim()})
        `;
      }
    }

    for (let i = 0; i < project.screenshots.length; i++) {
      const scrUrl = project.screenshots[i];
      if (scrUrl.trim()) {
        await sql`
          INSERT INTO project_screenshots (id, project_id, image_url, "order")
          VALUES (${crypto.randomUUID()}, ${projectId}, ${scrUrl.trim()}, ${i})
        `;
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/projects");
  return { success: true };
}

export async function deleteProject(id: string) {
  // Fetch details to delete blobs
  const oldProjects = await sql`SELECT * FROM projects WHERE id = ${id}`;
  const project = oldProjects[0];
  if (project) {
    await deleteBlobIfValid(project.image_url);
  }

  const screenshots = await sql`SELECT * FROM project_screenshots WHERE project_id = ${id}`;
  for (const scr of screenshots) {
    await deleteBlobIfValid(scr.image_url);
  }

  // Delete DB records
  await sql`DELETE FROM project_technologies WHERE project_id = ${id}`;
  await sql`DELETE FROM project_screenshots WHERE project_id = ${id}`;
  await sql`DELETE FROM projects WHERE id = ${id}`;

  revalidatePath("/");
  revalidatePath("/projects");
  return { success: true };
}

// Hero Data Actions
export async function saveHeroData(hero: {
  job_status: string;
  profile_image_url: string;
  cv_url: string;
}) {
  const currentRows = await sql`SELECT * FROM hero_data LIMIT 1`;
  const existing = currentRows[0];

  if (existing) {
    // Delete replaced blobs
    if (existing.profile_image_url !== hero.profile_image_url) {
      await deleteBlobIfValid(existing.profile_image_url);
    }
    if (existing.cv_url !== hero.cv_url) {
      await deleteBlobIfValid(existing.cv_url);
    }

    await sql`
      UPDATE hero_data 
      SET job_status = ${hero.job_status}, 
          profile_image_url = ${hero.profile_image_url}, 
          cv_url = ${hero.cv_url}, 
          updated_at = NOW()
      WHERE id = ${existing.id}
    `;
  } else {
    await sql`
      INSERT INTO hero_data (id, job_status, profile_image_url, cv_url, updated_at)
      VALUES (${crypto.randomUUID()}, ${hero.job_status}, ${hero.profile_image_url}, ${hero.cv_url}, NOW())
    `;
  }

  revalidatePath("/");
  return { success: true };
}

// Certificates Actions
export async function saveCertificate(cert: {
  id?: string;
  title: string;
  issued_by: string;
  image_url: string;
}) {
  if (cert.id) {
    const oldCerts = await sql`SELECT * FROM certificates WHERE id = ${cert.id}`;
    const oldCert = oldCerts[0];
    if (oldCert && oldCert.image_url !== cert.image_url) {
      await deleteBlobIfValid(oldCert.image_url);
    }

    await sql`
      UPDATE certificates 
      SET title = ${cert.title}, 
          issued_by = ${cert.issued_by}, 
          image_url = ${cert.image_url} 
      WHERE id = ${cert.id}
    `;
  } else {
    await sql`
      INSERT INTO certificates (id, title, issued_by, image_url, created_at)
      VALUES (${crypto.randomUUID()}, ${cert.title}, ${cert.issued_by}, ${cert.image_url}, NOW())
    `;
  }

  revalidatePath("/about");
  return { success: true };
}

export async function deleteCertificate(id: string) {
  const oldCerts = await sql`SELECT * FROM certificates WHERE id = ${id}`;
  const oldCert = oldCerts[0];
  if (oldCert) {
    await deleteBlobIfValid(oldCert.image_url);
  }

  await sql`DELETE FROM certificates WHERE id = ${id}`;

  revalidatePath("/about");
  return { success: true };
}

// Skills Administration Actions
export async function saveSkillCategory(category: {
  id?: string;
  title: string;
  icon: string;
  featured: boolean;
  size: number;
}) {
  if (category.id) {
    await sql`
      UPDATE skill_categories 
      SET title = ${category.title}, 
          icon = ${category.icon}, 
          featured = ${category.featured}, 
          size = ${category.size}, 
          updated_at = NOW() 
      WHERE id = ${category.id}
    `;
  } else {
    await sql`
      INSERT INTO skill_categories (id, title, icon, featured, size, created_at, updated_at)
      VALUES (${crypto.randomUUID()}, ${category.title}, ${category.icon}, ${category.featured}, ${category.size}, NOW(), NOW())
    `;
  }

  revalidatePath("/");
  revalidatePath("/skills");
  return { success: true };
}

export async function deleteSkillCategory(id: string) {
  await sql`DELETE FROM skill_items WHERE category_id = ${id}`;
  await sql`DELETE FROM skill_categories WHERE id = ${id}`;

  revalidatePath("/");
  revalidatePath("/skills");
  return { success: true };
}

export async function saveSkillItem(item: {
  id?: string;
  category_id: string;
  name: string;
}) {
  if (item.id) {
    await sql`
      UPDATE skill_items 
      SET name = ${item.name} 
      WHERE id = ${item.id}
    `;
  } else {
    await sql`
      INSERT INTO skill_items (id, category_id, name)
      VALUES (${crypto.randomUUID()}, ${item.category_id}, ${item.name})
    `;
  }

  revalidatePath("/");
  revalidatePath("/skills");
  return { success: true };
}

export async function deleteSkillItem(id: string) {
  await sql`DELETE FROM skill_items WHERE id = ${id}`;

  revalidatePath("/");
  revalidatePath("/skills");
  return { success: true };
}

export async function uploadFileAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const blob = await put(file.name, file, {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return { url: blob.url };
}

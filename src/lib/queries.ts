import { sql } from "./db";

// TypeScript Interfaces for Database Entities

export interface HeroData {
  id: string;
  job_status: string;
  profile_image_url: string;
  cv_url: string;
  updated_at: Date;
}

export interface AboutStat {
  id: string;
  value: string;
  label: string;
  color: string;
  order: number;
  created_at: Date;
  updated_at: Date;
}

export interface AboutFocus {
  id: string;
  item: string;
  order: number;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  order: number;
}

export interface Certificate {
  id: string;
  title: string;
  issued_by: string;
  image_url: string;
  created_at: Date;
}

export interface ProjectTechnology {
  id: string;
  project_id: string;
  name: string;
}

export interface ProjectScreenshot {
  id: string;
  project_id: string;
  image_url: string;
  order: number;
}

export interface Project {
  id: string;
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
  created_at: Date;
  updated_at: Date;
  tech: string[];
  screenshots: string[];
}

export interface SkillItem {
  id: string;
  category_id: string;
  name: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  icon: string;
  featured: boolean;
  size: number;
  created_at: Date;
  updated_at: Date;
  items: SkillItem[];
}

export interface CoreTechItem {
  id: string;
  name: string;
  order: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CoreCurriculumItem {
  id: string;
  title: string;
  description: string;
  order: number;
  created_at?: Date;
  updated_at?: Date;
}



// Slugification helper
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // strip non-word characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, "-")     // replace spaces with hyphens
    .replace(/-+/g, "-");     // collapse multiple hyphens
}

// DB query functions

export async function getHeroData(): Promise<HeroData | null> {
  try {
    const rows = await sql`SELECT * FROM hero_data LIMIT 1`;
    return rows[0] ? (rows[0] as unknown as HeroData) : null;
  } catch (error) {
    console.error("Error in getHeroData:", error);
    return null;
  }
}

export async function getAboutStats(): Promise<AboutStat[]> {
  try {
    const rows = await sql`SELECT * FROM about_stats ORDER BY "order" ASC, id ASC`;
    return rows as unknown as AboutStat[];
  } catch (error) {
    console.error("Error in getAboutStats:", error);
    return [];
  }
}

export async function getAboutFocus(): Promise<AboutFocus[]> {
  try {
    const rows = await sql`SELECT * FROM about_focus ORDER BY "order" ASC, id ASC`;
    return rows as unknown as AboutFocus[];
  } catch (error) {
    console.error("Error in getAboutFocus:", error);
    return [];
  }
}

export async function getEducation(): Promise<Education[]> {
  try {
    const rows = await sql`SELECT * FROM education ORDER BY "order" ASC, id ASC`;
    return rows as unknown as Education[];
  } catch (error) {
    console.error("Error in getEducation:", error);
    return [];
  }
}

export async function getCertificates(): Promise<Certificate[]> {
  try {
    const rows = await sql`SELECT * FROM certificates ORDER BY created_at DESC, id ASC`;
    return rows as unknown as Certificate[];
  } catch (error) {
    console.error("Error in getCertificates:", error);
    return [];
  }
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    const projects = await sql`SELECT * FROM projects ORDER BY "order" ASC, created_at DESC`;
    const techs = await sql`SELECT * FROM project_technologies`;
    const screenshots = await sql`SELECT * FROM project_screenshots ORDER BY "order" ASC`;

    return projects.map((p) => {
      const projectTechs = techs
        .filter((t) => t.project_id === p.id)
        .map((t) => t.name);
      const projectScreenshots = screenshots
        .filter((s) => s.project_id === p.id)
        .map((s) => s.image_url);
      return {
        ...p,
        tech: projectTechs,
        screenshots: projectScreenshots,
      } as unknown as Project;
    });
  } catch (error) {
    console.error("Error in getAllProjects:", error);
    return [];
  }
}

export async function getAllSkills(): Promise<SkillCategory[]> {
  try {
    const categories = await sql`SELECT * FROM skill_categories ORDER BY created_at ASC`;
    const items = await sql`SELECT * FROM skill_items`;

    return categories.map((cat) => {
      const catItems = items.filter((item) => item.category_id === cat.id) as unknown as SkillItem[];
      return {
        ...cat,
        items: catItems,
      } as unknown as SkillCategory;
    });
  } catch (error) {
    console.error("Error in getAllSkills:", error);
    return [];
  }
}

export async function getCoreCurriculum(): Promise<CoreCurriculumItem[]> {
  try {
    const rows = await sql`SELECT * FROM core_curriculum ORDER BY "order" ASC, id ASC`;
    return rows as unknown as CoreCurriculumItem[];
  } catch (error) {
    console.error("Error in getCoreCurriculum:", error);
    return [];
  }
}

export async function getHomePageData() {
  const [hero, aboutStats, aboutFocus, projects, skills, education, curriculum] = await Promise.all([
    getHeroData(),
    getAboutStats(),
    getAboutFocus(),
    getAllProjects(),
    getAllSkills(),
    getEducation(),
    getCoreCurriculum(),
  ]);
  return { hero, aboutStats, aboutFocus, projects, skills, education, curriculum };
}

export async function getCoreTechStack(): Promise<CoreTechItem[]> {
  try {
    const rows = await sql`SELECT * FROM core_tech_stack ORDER BY "order" ASC, id ASC`;
    return rows as unknown as CoreTechItem[];
  } catch (error) {
    console.error("Error in getCoreTechStack:", error);
    return [];
  }
}

export async function getAboutPageData() {
  const [aboutStats, aboutFocus, education, certificates, coreTech] = await Promise.all([
    getAboutStats(),
    getAboutFocus(),
    getEducation(),
    getCertificates(),
    getCoreTechStack(),
  ]);
  return { aboutStats, aboutFocus, education, certificates, coreTech };
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const projects = await getAllProjects();
    return projects.find((p) => slugify(p.title) === slug) || null;
  } catch (error) {
    console.error("Error in getProjectBySlug:", error);
    return null;
  }
}

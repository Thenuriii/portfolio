import AdminSidebar from "@/components/AdminSidebar";
import AdminDashboardClient from "@/components/AdminDashboardClient";
import {
  getHeroData,
  getCertificates,
  getCoreTechStack,
  getEducation,
  getCoreCurriculum,
  getAboutStats,
  getAboutFocus,
  getAllProjects,
  getAllSkills
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    hero,
    certificates,
    coreTech,
    education,
    curriculum,
    aboutStats,
    aboutFocus,
    projects,
    skills
  ] = await Promise.all([
    getHeroData(),
    getCertificates(),
    getCoreTechStack(),
    getEducation(),
    getCoreCurriculum(),
    getAboutStats(),
    getAboutFocus(),
    getAllProjects(),
    getAllSkills()
  ]);

  const stats = {
    projectsCount: projects.length,
    skillsCount: skills.reduce((acc, cat) => acc + (cat.items?.length || 0), 0)
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0b0813] text-gray-100 selection:bg-purple-500 selection:text-white">
      <AdminDashboardClient
        hero={hero}
        certificates={certificates}
        stats={stats}
        coreTech={coreTech}
        education={education}
        curriculum={curriculum}
        aboutStats={aboutStats}
        aboutFocus={aboutFocus}
        projects={projects}
        skills={skills}
      />
    </div>
  );
}

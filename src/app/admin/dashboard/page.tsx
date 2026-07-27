import AdminSidebar from "@/components/AdminSidebar";
import AdminDashboardClient from "@/components/AdminDashboardClient";
import { getHeroData, getCertificates } from "@/lib/queries";
import { sql } from "@/lib/db";

export default async function AdminDashboardPage() {
  const hero = await getHeroData();
  const certificates = await getCertificates();

  // Load counts dynamically
  const projectCountRes = await sql`SELECT COUNT(*)::integer as count FROM projects`;
  const projectsCount = projectCountRes[0]?.count || 0;

  const skillCountRes = await sql`SELECT COUNT(*)::integer as count FROM skill_items`;
  const skillsCount = skillCountRes[0]?.count || 0;

  const stats = {
    projectsCount,
    skillsCount
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-6">Dashboard Overview</h1>
        <AdminDashboardClient hero={hero} certificates={certificates} stats={stats} />
      </main>
    </div>
  );
}

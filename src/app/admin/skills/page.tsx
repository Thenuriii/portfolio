import AdminSidebar from "@/components/AdminSidebar";
import AdminSkillsClient from "@/components/AdminSkillsClient";
import { getAllSkills } from "@/lib/queries";

export default async function AdminSkillsPage() {
  const skills = await getAllSkills();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Skills</h1>
        </div>
        <AdminSkillsClient initialCategories={skills} />
      </main>
    </div>
  );
}


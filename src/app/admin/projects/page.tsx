import AdminSidebar from "@/components/AdminSidebar";
import AdminProjectsClient from "@/components/AdminProjectsClient";
import { getAllProjects } from "@/lib/queries";

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Projects</h1>
        </div>
        <AdminProjectsClient initialProjects={projects} />
      </main>
    </div>
  );
}

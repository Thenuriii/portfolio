import AdminSidebar from "@/components/AdminSidebar";

export default function AdminSkillsPage() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Skills</h1>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
            + Add Skill
          </button>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-gray-600">List and update your technical skills here.</p>
        </div>
      </main>
    </div>
  );
}

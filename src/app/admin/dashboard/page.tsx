import AdminSidebar from "@/components/AdminSidebar";

export default function AdminDashboardPage() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500">Total Projects</h2>
            <p className="text-3xl font-bold mt-2">12</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500">Skills Listed</h2>
            <p className="text-3xl font-bold mt-2">18</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500">New Messages</h2>
            <p className="text-3xl font-bold mt-2">5</p>
          </div>
        </div>
      </main>
    </div>
  );
}

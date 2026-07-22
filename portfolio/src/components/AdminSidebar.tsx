import Link from "next/link";

export default function AdminSidebar() {
    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen p-6 flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold mb-8 text-blue-400">
                    Admin Portal
                </h2>

                <nav className="flex flex-col space-y-3 text-sm">
                    <Link
                        href="/admin/dashboard"
                        className="px-3 py-2 rounded hover:bg-gray-800 transition-colors"
                    >
                        Dashboard
                    </Link>

                    <Link
                        href="/admin/projects"
                        className="px-3 py-2 rounded hover:bg-gray-800 transition-colors"
                    >
                        Manage Projects
                    </Link>

                    <Link
                        href="/admin/skills"
                        className="px-3 py-2 rounded hover:bg-gray-800 transition-colors"
                    >
                        Manage Skills
                    </Link>
                </nav>
            </div>

            <Link
                href="/"
                className="text-xs text-gray-400 hover:text-white transition-colors"
            >
                ← Return to Public Site
            </Link>
        </aside>
    );
}
import Link from "next/link";
export default function Navbar() {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-blue-600">
                    Portfolio
                </Link>
                <nav className="flex space-x-6 text-sm font-medium text-gray-700">
                    <Link href="/" className="hover:text-blue-600 transition-colors">
                        Home
                    </Link>
                    <Link href="/about" className="hover:text-blue-600 transition-colors">
                        About
                    </Link>
                    <Link href="/projects" className="hover:text-blue-600 transition-colors">
                        Projects
                    </Link>
                    <Link href="/contact" className="hover:text-blue-600 transition-colors">
                        Contact
                    </Link>
                    <Link href="/admin/login" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md transition-colors">
                        Admin
                    </Link>
                </nav>
            </div>
        </header>
    );
}
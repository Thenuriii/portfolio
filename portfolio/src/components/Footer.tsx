import Link from "next/link";
export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between 
     items-center gap-4 text-sm text-gray-600">
                <div>
                    <p>© {new Date().getFullYear()} Portfolio. All rights reserved.</p>
                </div>
                <div className="flex space-x-6">
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
                </div>
            </div>
        </footer>
    );
}
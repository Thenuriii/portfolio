import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full">
                <h1 className="text-3xl font-bold mb-6">About Me</h1>

                <p className="text-gray-700 leading-relaxed mb-6">
                    I am a software engineer dedicated to designing and developing web
                    products that offer great user experiences and strong performance.
                </p>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Core Tech Stack</h2>

                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-gray-600">
                        <li className="bg-gray-100 p-2 rounded text-center">
                            React / Next.js
                        </li>

                        <li className="bg-gray-100 p-2 rounded text-center">
                            TypeScript
                        </li>

                        <li className="bg-gray-100 p-2 rounded text-center">
                            Tailwind CSS
                        </li>

                        <li className="bg-gray-100 p-2 rounded text-center">
                            Node.js
                        </li>

                        <li className="bg-gray-100 p-2 rounded text-center">
                            PostgreSQL / Prisma
                        </li>

                        <li className="bg-gray-100 p-2 rounded text-center">
                            REST & GraphQL
                        </li>
                    </ul>
                </div>
            </main>

            <Footer />
        </div>
    );
}

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const mockProjects = [
    {
        id: "1",
        title: "E-Commerce Platform",
        description:
            "Full-featured online store built with Next.js and Stripe.",
        tech: ["Next.js", "TypeScript", "Tailwind CSS"],
    },
    {
        id: "2",
        title: "Task Management App",
        description:
            "Productivity application featuring real-time state synchronization.",
        tech: ["React", "Prisma", "PostgreSQL"],
    },
];

export default function ProjectsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 py-12 flex-1 w-full">
                <h1 className="text-3xl font-bold mb-8">
                    Featured Projects
                </h1>

                <div className="grid md:grid-cols-2 gap-6">
                    {mockProjects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <h2 className="text-xl font-bold mb-2">
                                {project.title}
                            </h2>

                            <p className="text-gray-600 mb-4">
                                {project.description}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {project.tech.map((t, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
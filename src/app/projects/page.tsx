import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getAllProjects, slugify } from "@/lib/queries";

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-28 flex-1 w-full">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Featured Projects</h1>
        
        {projects && projects.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${slugify(project.title)}`}
                className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200 block group"
              >
                <h2 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-purple-600 transition-colors">
                  {project.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded font-medium border border-purple-100"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-sm">No projects listed yet. Check back later!</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
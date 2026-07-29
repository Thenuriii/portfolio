import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProjectBySlug } from "@/lib/queries";
import { notFound } from "next/navigation";
import { getPublicUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-28 flex-1 w-full space-y-8">
        {/* Navigation back */}
        <div>
          <a
            href="/projects"
            className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Projects</span>
          </a>
        </div>

        {/* Title and Category */}
        <div className="space-y-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-mono rounded-full font-bold">
            {project.category || "Project"}
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{project.title}</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span>Live Preview</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span>GitHub Repository</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          )}
        </div>

        {/* Tech Stack used */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-gray-800">Technologies Used</h2>
          <div className="flex flex-wrap gap-2">
            {project.tech && project.tech.length > 0 ? (
              project.tech.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg border border-purple-100 font-medium"
                >
                  {t}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500 italic">No specific technologies logged.</span>
            )}
          </div>
        </div>

        {/* Main description and details */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Project Overview</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{project.description}</p>
        </div>

        {/* Screenshots */}
        {project.screenshots && project.screenshots.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Screenshots</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.screenshots.map((url, idx) => (
                <div
                  key={idx}
                  className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm overflow-hidden group"
                >
                  <img
                    src={getPublicUrl(url)}
                    alt={`${project.title} screenshot ${idx + 1}`}
                    className="w-full h-auto object-cover rounded-xl group-hover:scale-[1.01] transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video demonstration */}
        {project.video_url && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Video Demo</h2>
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-100 shadow-inner">
              <iframe
                src={project.video_url}
                className="w-full h-full border-0"
                allowFullScreen
                title={`${project.title} Video Demo`}
              ></iframe>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAboutPageData } from "@/lib/queries";
import { getPublicUrl } from "@/lib/utils";

export default async function AboutPage() {
  const { aboutStats, aboutFocus, education, certificates } = await getAboutPageData();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-28 flex-1 w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">About Me</h1>
        
        {aboutFocus && aboutFocus.length > 0 ? (
          aboutFocus.map((focus) => (
            <p key={focus.id} className="text-gray-700 leading-relaxed mb-6">
              {focus.item}
            </p>
          ))
        ) : (
          <p className="text-gray-700 leading-relaxed mb-6">
            I am a software engineer dedicated to designing and developing web products that offer great user experiences and strong performance.
          </p>
        )}

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-850">Core Tech Stack</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-gray-650">
            <li className="bg-gray-50 p-2 rounded text-center border border-gray-100">React / Next.js</li>
            <li className="bg-gray-50 p-2 rounded text-center border border-gray-100">TypeScript</li>
            <li className="bg-gray-50 p-2 rounded text-center border border-gray-100">Tailwind CSS</li>
            <li className="bg-gray-50 p-2 rounded text-center border border-gray-100">Node.js</li>
            <li className="bg-gray-50 p-2 rounded text-center border border-gray-100">PostgreSQL / Prisma</li>
            <li className="bg-gray-50 p-2 rounded text-center border border-gray-100">REST & GraphQL</li>
          </ul>
        </div>

        {/* Education Section */}
        {education && education.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-850">Education</h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificates Section */}
        {certificates && certificates.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-850">Certifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  {cert.image_url ? (
                    <img src={getPublicUrl(cert.image_url)} alt={cert.title} className="w-10 h-10 object-cover rounded border border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 bg-purple-100 border border-purple-250 rounded flex items-center justify-center text-purple-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-gray-800">{cert.title}</h3>
                    <p className="text-xs text-gray-600">{cert.issued_by}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

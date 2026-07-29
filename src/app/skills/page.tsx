import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllSkills } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const skills = await getAllSkills();

  const renderIcon = (iconStr: string) => {
    if (iconStr && iconStr.trim().startsWith("<svg")) {
      return <span dangerouslySetInnerHTML={{ __html: iconStr }} className="text-purple-600" />;
    }
    return (
      <svg className="w-6 h-6 text-purple-655" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-28 flex-1 w-full space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 font-extrabold tracking-tight">Technical Skills</h1>
          <p className="text-gray-600 text-sm max-w-xl">
            A comprehensive list of language platforms, frameworks, backend services, and databases that I leverage.
          </p>
        </div>

        {skills && skills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {skills.map((category) => (
              <div
                key={category.id}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 shrink-0">
                      {renderIcon(category.icon)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">{category.title}</h2>
                      {category.size && (
                        <span className="text-[10px] text-gray-550 font-mono font-semibold uppercase bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {category.size} items
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                    {category.items && category.items.length > 0 ? (
                      category.items.map((item) => (
                        <span
                          key={item.id}
                          className="text-xs bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 font-medium"
                        >
                          {item.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No skills cataloged in this category.</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-550 text-sm">No skills cataloged yet. Check back later!</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

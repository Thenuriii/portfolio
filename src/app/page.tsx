import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundAnimation from "@/components/BackgroundAnimation";
import ContactForm from "@/components/ContactForm";
import Link from "next/link";
import { getHomePageData, slugify } from "@/lib/queries";
import { getPublicUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { hero, aboutStats, aboutFocus, projects, skills, education, curriculum } = await getHomePageData();

  // Helper function to safely render category icons
  const renderIcon = (iconStr: string) => {
    if (iconStr && iconStr.trim().startsWith("<svg")) {
      return <span dangerouslySetInnerHTML={{ __html: iconStr }} />;
    }
    // Fallback default SVG (original code icon)
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#0b0813] text-zinc-100 selection:bg-purple-500 selection:text-white overflow-x-hidden">
      <BackgroundAnimation />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20 space-y-32">
          <section id="home" className="relative pt-6 pb-12 min-h-[85vh] flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
              <div className="lg:col-span-7 space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                  {hero?.job_status ? (
                    <>
                      {hero.job_status.includes("&") ? (
                        <>
                          {hero.job_status.split("&")[0].trim()} <br />
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-400 to-indigo-300">
                            &amp; {hero.job_status.split("&")[1].trim()}
                          </span>
                        </>
                      ) : (
                        hero.job_status
                      )}
                    </>
                  ) : (
                    <>
                      MIS Undergraduate <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-400 to-indigo-300">
                        &amp; UI/UX Enthusiast
                      </span>
                    </>
                  )}
                </h1>

                <p className="text-purple-200/80 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                  Focusing on crafting intuitive user experiences, modern UI designs, and robust web technologies backed by efficient database management systems.
                </p>

                <div className="pt-2 flex flex-wrap gap-4 items-center">
                  <a
                    href="#projects"
                    className="px-7 py-3.5 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 flex items-center gap-2 border border-purple-400/30"
                  >
                    <span>View Projects</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>

                  <a
                    href={getPublicUrl(hero?.cv_url) || "#contact"}
                    target={hero?.cv_url ? "_blank" : undefined}
                    rel={hero?.cv_url ? "noopener noreferrer" : undefined}
                    className="px-6 py-3.5 bg-[#130f24]/80 hover:bg-[#1a1433] text-purple-200 border border-purple-500/30 hover:border-purple-400/60 font-medium text-xs sm:text-sm rounded-xl transition-all backdrop-blur-md flex items-center gap-2"
                  >
                    <span>Download CV</span>
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/30 via-indigo-500/20 to-pink-500/20 blur-md animate-pulse"></div>
                  <div className="absolute -inset-2 rounded-full border border-dashed border-purple-500/40 pointer-events-none"></div>

                  <div className="w-full h-full rounded-full bg-gradient-to-b from-[#130f24]/90 to-[#0d0918]/95 border border-purple-500/40 relative overflow-hidden shadow-2xl backdrop-blur-xl group">
                    {hero?.profile_image_url ? (
                      <img
                        src={getPublicUrl(hero.profile_image_url)}
                        alt="Nimsara"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                      />
                    ) : (
                      <div className="w-full h-full p-4 flex flex-col justify-center items-center text-center relative">
                        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:16px_16px]"></div>

                        <div className="w-24 h-24 rounded-full bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-3 group-hover:scale-105 transition-transform shadow-lg shadow-purple-500/20">
                          <svg className="w-12 h-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>

                        <span className="text-xs font-semibold text-white tracking-wide">
                          Photo Placeholder
                        </span>
                        <span className="text-[11px] text-purple-300/70 mt-1 max-w-[160px] leading-tight">
                          Add your profile photo here
                        </span>

                        <div className="mt-3 px-3 py-1 rounded-full bg-[#0d0918]/90 border border-purple-500/30 text-[10px] font-mono text-purple-300 flex items-center gap-1.5 shadow-md">
                          <svg className="w-3 h-3 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>upload_photo.jpg</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="absolute -top-2 left-4 px-3 py-1.5 rounded-xl bg-[#130f24]/90 border border-purple-500/30 shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-medium text-zinc-200">
                    <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                    <span>UI / UX</span>
                  </div>

                  <div className="absolute top-1/2 -left-6 px-3 py-1.5 rounded-xl bg-[#130f24]/90 border border-purple-500/30 shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-medium text-zinc-200">
                    <span className="text-purple-400 font-mono">&lt;/&gt;</span>
                    <span>React</span>
                  </div>

                  <div className="absolute -bottom-2 right-6 px-3 py-1.5 rounded-xl bg-[#130f24]/90 border border-purple-500/30 shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-medium text-zinc-200">
                    <svg className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span>Figma</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="about" className="scroll-mt-28 space-y-8">
            <div className="border-b border-purple-500/20 pb-4 flex items-center justify-between">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                About <span className="text-purple-400">Me</span>
              </h2>
              <span className="text-xs font-mono text-purple-400/80 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                01 // BACKGROUND
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              <div className="md:col-span-4 bg-[#130f24]/70 border border-purple-500/20 rounded-2xl p-8 flex flex-col justify-center items-start space-y-6 hover:border-purple-500/50 transition-all shadow-xl backdrop-blur-xl group">
                {aboutStats && aboutStats.length > 0 ? (
                  aboutStats.slice(0, 1).map((stat) => (
                    <div key={stat.id} className="flex flex-col space-y-2">
                      <span className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.color || "from-purple-300 via-purple-400 to-indigo-300"} tracking-tight group-hover:scale-105 transition-transform`}>
                        {stat.value}
                      </span>
                      <span className="text-xs font-bold text-purple-200/70 tracking-wider uppercase font-mono">
                        {stat.label}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col space-y-2">
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-400 to-indigo-300 tracking-tight group-hover:scale-105 transition-transform">
                      04+
                    </span>
                    <span className="text-xs font-bold text-purple-200/70 tracking-wider uppercase font-mono">
                      ACADEMIC PROJECTS
                    </span>
                  </div>
                )}
              </div>

              <div className="md:col-span-8 bg-[#130f24]/60 border border-purple-500/20 rounded-2xl p-8 space-y-6 flex flex-col justify-between backdrop-blur-xl">
                {aboutFocus && aboutFocus.length > 0 ? (
                  <div className="space-y-4">
                    {aboutFocus.map((focus) => (
                      <p key={focus.id} className="text-purple-100 text-sm sm:text-base leading-relaxed font-normal">
                        {focus.item}
                      </p>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="text-purple-100 text-sm sm:text-base leading-relaxed font-normal">
                      A dedicated and detail-oriented <strong className="text-purple-300">Management Information Systems undergraduate</strong> with a strong interest in UI design and user experience, possessing strong foundational software development, web technologies, and database systems knowledge.
                    </p>
                    <p className="text-purple-200/70 text-xs sm:text-sm leading-relaxed">
                      Third-year student pursuing a BSc in Management Information Systems (Special) at <span className="text-white font-medium">NSBM Green University</span>.
                    </p>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-500/20">
                  {aboutStats && aboutStats.length > 1 ? (
                    aboutStats.slice(1).map((stat) => (
                      <div key={stat.id}>
                        <span className={`text-2xl font-bold ${stat.color || "text-purple-300"}`}>{stat.value}</span>
                        <p className="text-xs text-purple-300/70 mt-0.5">{stat.label}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      <div>
                        <span className="text-2xl font-bold text-purple-300">100%</span>
                        <p className="text-xs text-purple-300/70 mt-0.5">Code Quality</p>
                      </div>
                      <div>
                        <span className="text-2xl font-bold text-purple-300">Fast</span>
                        <p className="text-xs text-purple-300/70 mt-0.5">Learner</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section id="skills" className="scroll-mt-28 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-white">
                  My <span className="text-purple-400">Advantage</span>
                </h2>
                <p className="text-purple-200/70 text-xs sm:text-sm max-w-xl">
                  I leverage a comprehensive set of modern tools and technologies to create efficient, scalable, and visually premium digital solutions.
                </p>
              </div>
              <span className="hidden sm:inline-block text-xs font-mono text-purple-400/80 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                02 // TECH STACK
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {skills && skills.length > 0 ? (
                skills.map((category) => (
                  <div
                    key={category.id}
                    className="bg-[#130f24]/70 border border-purple-500/20 rounded-2xl p-6 space-y-4 hover:border-purple-500/50 transition-all hover:-translate-y-1 backdrop-blur-xl shadow-xl"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-300">
                      {renderIcon(category.icon)}
                    </div>
                    <h3 className="text-base font-bold text-white">{category.title}</h3>
                    <ul className="space-y-2 text-xs text-purple-200/70 font-mono">
                      {category.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-[#130f24]/70 border border-purple-500/20 rounded-2xl p-6 space-y-4 hover:border-purple-500/50 transition-all hover:-translate-y-1 backdrop-blur-xl shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-white">Languages</h3>
                    <ul className="space-y-2 text-xs text-purple-200/70 font-mono">
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Java</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>C# / .NET</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Python</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>JavaScript</li>
                    </ul>
                  </div>

                  <div className="bg-[#130f24]/70 border border-purple-500/20 rounded-2xl p-6 space-y-4 hover:border-purple-500/50 transition-all hover:-translate-y-1 backdrop-blur-xl shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-white">Frameworks</h3>
                    <ul className="space-y-2 text-xs text-purple-200/70 font-mono">
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Flutter</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>React / Next.js</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>ASP.NET MVC</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>PHP</li>
                    </ul>
                  </div>

                  <div className="bg-[#130f24]/70 border border-purple-500/20 rounded-2xl p-6 space-y-4 hover:border-purple-500/50 transition-all hover:-translate-y-1 backdrop-blur-xl shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-white">Backend</h3>
                    <ul className="space-y-2 text-xs text-purple-200/70 font-mono">
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Node.js / Express</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>C# Core</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Auth Systems</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Microservices</li>
                    </ul>
                  </div>

                  <div className="bg-[#130f24]/70 border border-purple-500/20 rounded-2xl p-6 space-y-4 hover:border-purple-500/50 transition-all hover:-translate-y-1 backdrop-blur-xl shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-white">Databases</h3>
                    <ul className="space-y-2 text-xs text-purple-200/70 font-mono">
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>MySQL / MS SQL</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>PostgreSQL</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Firebase</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Docker</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </section>

          <section id="projects" className="scroll-mt-28 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white">
                  Recent <span className="text-purple-400">Work.</span>
                </h2>
                <p className="text-purple-200/70 text-xs sm:text-sm max-w-xl mt-1">
                  Showcasing test and preliminary projects across web apps, inventory systems, and match-making management.
                </p>
              </div>

              <span className="text-xs font-mono text-purple-400/80 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                03 // FEATURED PROJECTS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects && projects.length > 0 ? (
                projects.map((project) => (
                  <Link
                    href={`/projects/${slugify(project.title)}`}
                    key={project.id}
                    className="bg-[#130f24]/70 border border-purple-500/20 rounded-2xl overflow-hidden group hover:border-purple-500/50 transition-all flex flex-col justify-between backdrop-blur-xl shadow-xl hover:-translate-y-1 duration-300"
                  >
                    {project.image_url ? (
                      <div className="h-44 bg-[#0d0918] border-b border-purple-500/20 relative overflow-hidden flex items-center justify-center">
                        <img
                          src={getPublicUrl(project.image_url)}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                        <span className="absolute top-3 right-3 text-[10px] font-mono text-purple-300/80 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/20">
                          {project.category || "Project"}
                        </span>
                      </div>
                    ) : (
                      <div className="h-44 bg-[#0d0918] border-b border-purple-500/20 p-4 flex flex-col justify-between relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                          </div>
                          <span className="text-[10px] font-mono text-purple-300/80 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/20">
                            UI Preview
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 opacity-60 group-hover:opacity-90 transition-opacity my-auto">
                          <div className="h-16 rounded bg-purple-950/60 border border-purple-500/30 p-2 flex flex-col justify-end">
                            <div className="h-2 w-3/4 bg-purple-400/80 rounded mb-1"></div>
                            <div className="h-1.5 w-1/2 bg-zinc-400/40 rounded"></div>
                          </div>
                          <div className="h-16 rounded bg-purple-950/60 border border-purple-500/30 p-2 flex flex-col justify-end">
                            <div className="h-2 w-3/4 bg-purple-400/80 rounded mb-1"></div>
                            <div className="h-1.5 w-1/2 bg-zinc-400/40 rounded"></div>
                          </div>
                          <div className="h-16 rounded bg-purple-950/60 border border-purple-500/30 p-2 flex flex-col justify-end">
                            <div className="h-2 w-3/4 bg-purple-400/80 rounded mb-1"></div>
                            <div className="h-1.5 w-1/2 bg-zinc-400/40 rounded"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                          {project.title}
                        </h3>
                        {project.tech && project.tech.length > 0 && (
                          <span className="text-[11px] font-mono text-purple-400 block mt-0.5">
                            {project.tech.join(" + ")}
                          </span>
                        )}
                        <p className="text-xs text-purple-200/70 leading-relaxed mt-2 line-clamp-3">
                          {project.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-[#130f24]/40 border border-purple-500/20 rounded-2xl backdrop-blur-xl shadow-xl">
                  <p className="text-sm text-purple-300/85 italic">No projects listed yet. Check back soon!</p>
                </div>
              )}
            </div>
          </section>

          <section id="education" className="scroll-mt-28 space-y-8">
            <div className="border-b border-purple-500/20 pb-4 flex items-center justify-between">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Academic <span className="text-purple-400">Path</span>
              </h2>
              <span className="text-xs font-mono text-purple-400/80 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                04 // EDUCATION
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {education && education.length > 0 ? (
                education.map((edu, idx) => (
                  <div key={edu.id} className="md:col-span-5 space-y-4">
                    {idx === 0 && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-mono text-purple-300">
                        <span>2022 — Present</span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white leading-tight">
                      {edu.degree}
                    </h3>
                    <p className="text-xs font-semibold text-purple-300/80">
                      {edu.institution}
                    </p>
                    {idx === 0 && (
                      <p className="text-xs text-purple-200/70 leading-relaxed">
                        Building a comprehensive technical foundation combining software development, database engineering, and user-centric system architecture.
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="md:col-span-5 py-8 text-center bg-[#130f24]/40 border border-purple-500/20 rounded-2xl backdrop-blur-xl">
                  <p className="text-xs text-purple-300/85 italic">No education entries added yet. Configure education in the admin panel.</p>
                </div>
              )}

              <div className="md:col-span-7 bg-[#130f24]/70 border border-purple-500/20 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-xl">
                <h4 className="text-sm font-bold text-purple-200 uppercase tracking-wider font-mono">
                  Core Curriculum
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {curriculum && curriculum.length > 0 ? (
                    curriculum.map((item) => (
                      <div key={item.id} className="bg-[#0d0918]/80 p-4 rounded-xl border border-purple-500/20">
                        <h5 className="text-xs font-bold text-purple-300">{item.title}</h5>
                        <p className="text-[11px] text-purple-200/60 mt-1">{item.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-6 text-center text-xs text-purple-300/80 italic">
                      No curriculum topics listed yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section id="contact" className="scroll-mt-28 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Let&apos;s <span className="text-purple-400">Connect.</span>
              </h2>
              <p className="text-purple-200/70 text-xs sm:text-sm max-w-xl">
                Whether you have a question about my projects or just want to talk tech, my inbox is always open.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-5 space-y-4">
                <div className="bg-[#130f24]/70 border border-purple-500/20 rounded-2xl p-4 flex items-center gap-4 hover:border-purple-500/50 transition-colors backdrop-blur-xl shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono tracking-widest text-purple-400 uppercase block font-semibold">EMAIL</span>
                    <a href="mailto:thenuri678@gmail.com" className="text-sm font-bold text-white hover:text-purple-300 transition-colors break-all">
                      thenuri678@gmail.com
                    </a>
                  </div>
                </div>

                <div className="bg-[#130f24]/70 border border-purple-500/20 rounded-2xl p-4 flex items-center gap-4 hover:border-purple-500/50 transition-colors backdrop-blur-xl shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.64a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono tracking-widest text-purple-400 uppercase block font-semibold">LINKEDIN</span>
                    <a href="https://www.linkedin.com/in/thenuri-wickramadara" target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base font-bold text-white hover:text-purple-300 transition-colors break-all">
                      linkedin.com/in/thenuri-wickramadara
                    </a>
                  </div>
                </div>

                <div className="bg-[#130f24]/70 border border-purple-500/20 rounded-2xl p-4 flex items-center gap-4 hover:border-purple-500/50 transition-colors backdrop-blur-xl shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono tracking-widest text-purple-400 uppercase block font-semibold">GITHUB</span>
                    <a href="https://github.com/Thenuriii" target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base font-bold text-white hover:text-purple-300 transition-colors break-all">
                      github.com/Thenuriii
                    </a>
                  </div>
                </div>

                <div className="bg-[#130f24]/70 border border-purple-500/20 rounded-2xl p-4 flex items-center gap-4 hover:border-purple-500/50 transition-colors backdrop-blur-xl shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono tracking-widest text-purple-400 uppercase block font-semibold">LOCATION</span>
                    <span className="text-sm sm:text-base font-bold text-white">
                      Homagama, Sri Lanka
                    </span>
                  </div>
                </div>
              </div>

              <ContactForm />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}

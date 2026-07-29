"use client";

import Link from "next/link";
import { auth } from "@/lib/firebaseClient";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      await signOut(auth);
      router.push("/admin/login");
    } catch (err: any) {
      alert("Error logging out: " + err.message);
    }
  };

  const tabs = [
    { id: "hero", label: "Hero Info" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills Stack" },
    { id: "about-stats", label: "About Stats" },
    { id: "about-focus", label: "About Focus" },
    { id: "education", label: "Education" },
    { id: "certificates", label: "Certificates" },
    { id: "core-curriculum", label: "Core Curriculum" },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#110c22] border-b lg:border-b-0 lg:border-r border-purple-500/20 text-gray-200 p-6 flex flex-col justify-between shrink-0 lg:min-h-screen">
      <div>
        <div className="flex justify-between items-center lg:block mb-6 lg:mb-8">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
            Studio Control
          </h2>
          <button
            onClick={handleLogout}
            className="lg:hidden text-xs bg-red-950/40 border border-red-500/30 hover:bg-red-900/40 text-red-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>

        <nav className="flex flex-wrap lg:flex-col gap-2 text-xs pb-3 lg:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2.5 rounded-xl font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "bg-[#18122f]/50 hover:bg-[#1f183c] text-purple-200/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4 lg:mt-0 pt-4 border-t border-purple-500/10 flex justify-between lg:flex-col lg:gap-4">
        <Link
          href="/"
          className="text-xs text-purple-300/60 hover:text-purple-300 transition-colors flex items-center gap-1.5"
        >
          ← Return to Public Site
        </Link>
        <button
          onClick={handleLogout}
          className="hidden lg:block text-center w-full py-2.5 bg-red-950/40 border border-red-500/20 hover:bg-red-900/40 hover:border-red-500/40 text-red-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          Logout Session
        </button>
      </div>
    </aside>
  );
}
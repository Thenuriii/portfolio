import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-8 pt-4">
      <div className="bg-[#130f24]/75 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-purple-200/70">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-mono text-[10px] font-bold shadow-md shadow-purple-500/20">
            N
          </span>
          <span className="font-bold text-white tracking-tight text-sm">
            Nimsara
          </span>
        </div>

        <div className="text-center sm:text-left text-purple-300/70">
          © {new Date().getFullYear()} Nimsara. All rights reserved.
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 text-[11px] backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            UI/UX &amp; MIS Portfolio
          </span>
        </div>
      </div>
    </footer>
  );
}
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-6 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div
        className={`max-w-5xl mx-auto px-6 py-3 rounded-full transition-all duration-500 flex justify-between items-center ${
          scrolled
            ? "bg-[#130f24]/80 backdrop-blur-xl border border-purple-500/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] shadow-purple-500/15"
            : "bg-[#130f24]/50 backdrop-blur-md border border-purple-500/10 shadow-xl"
        }`}
      >
        <Link
          href="#home"
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2 group"
        >
          <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center text-white font-mono text-xs font-extrabold shadow-md shadow-purple-500/30 group-hover:scale-110 transition-transform">
            N
          </span>
          <span className="font-extrabold text-white tracking-wide">
            Nimsara
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold tracking-wide text-zinc-300">
          <Link
            href="#home"
            className="hover:text-purple-300 transition-colors py-1 relative group"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all group-hover:w-full rounded-full"></span>
          </Link>
          <Link
            href="#about"
            className="hover:text-purple-300 transition-colors py-1 relative group"
          >
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all group-hover:w-full rounded-full"></span>
          </Link>
          <Link
            href="#skills"
            className="hover:text-purple-300 transition-colors py-1 relative group"
          >
            Skills
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all group-hover:w-full rounded-full"></span>
          </Link>
          <Link
            href="#projects"
            className="hover:text-purple-300 transition-colors py-1 relative group"
          >
            Projects
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all group-hover:w-full rounded-full"></span>
          </Link>
          <Link
            href="#education"
            className="hover:text-purple-300 transition-colors py-1 relative group"
          >
            Education
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all group-hover:w-full rounded-full"></span>
          </Link>
          <Link
            href="#contact"
            className="hover:text-purple-300 transition-colors py-1 relative group"
          >
            Contact
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all group-hover:w-full rounded-full"></span>
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-3">
          <a
            href="#contact"
            className="bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-400 hover:to-indigo-400 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 flex items-center gap-1.5 border border-purple-400/30"
          >
            <span>Let&apos;s Connect</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-zinc-400 hover:text-white p-2 rounded-lg"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden max-w-6xl mx-auto mt-2 bg-[#130f24]/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 space-y-3 shadow-2xl">
          <Link
            href="#home"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-purple-400"
          >
            Home
          </Link>
          <Link
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-purple-400"
          >
            About
          </Link>
          <Link
            href="#skills"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-purple-400"
          >
            Skills
          </Link>
          <Link
            href="#projects"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-purple-400"
          >
            Projects
          </Link>
          <Link
            href="#education"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-purple-400"
          >
            Education
          </Link>
          <Link
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-purple-400"
          >
            Contact
          </Link>
          <div className="pt-2">
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl w-full justify-center shadow-lg shadow-purple-500/30"
            >
              Let&apos;s Connect ↗
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
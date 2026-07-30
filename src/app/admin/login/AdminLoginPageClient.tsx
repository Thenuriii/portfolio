"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function AdminLoginPageClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/admin/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const idToken = await result.user.getIdToken();

      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionRes.ok) {
        const data = await sessionRes.json();
        throw new Error(data.error || "Failed to establish secure session");
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("Login failure:", err);
      // Map common firebase errors to cleaner user facing strings
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setErrorMsg("Invalid email or password.");
      } else if (err.code === "auth/invalid-email") {
        setErrorMsg("Invalid email address format.");
      } else {
        setErrorMsg(err.message || "Failed to authenticate.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b0813] px-4 selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Visual background flares */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full bg-[#130f24]/80 border border-purple-500/20 backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Studio Portal</h1>
          <p className="text-xs text-purple-200/60 font-mono">Sign in to manage your portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-red-900/35 border border-red-500/30 rounded-xl text-xs text-red-200 leading-relaxed font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="e.g. admin@portfolio.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {loading ? "Authenticating..." : "Log In"}
          </button>
        </form>
      </div>
    </main>
  );
}

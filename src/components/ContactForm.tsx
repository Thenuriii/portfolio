"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="md:col-span-7 bg-[#130f24]/70 border border-purple-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
      {submitted ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">Message Sent!</h3>
          <p className="text-xs text-purple-200/70">Thank you for reaching out. I will get back to you shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-purple-200/70 mb-1.5">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-purple-200/70 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-purple-200/70 mb-1.5">Subject</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Project Inquiry"
              className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-purple-200/70 mb-1.5">Message</label>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell me about your project..."
              className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-400 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 border border-purple-400/30"
          >
            <span>Send Message</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}

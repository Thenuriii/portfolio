"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-12 flex-1 w-full">
        <h1 className="text-3xl font-bold mb-2">Get in Touch</h1>
        <p className="text-gray-600 mb-6">
          Feel free to reach out for collaborations or project inquiries.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your message here..."
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Send Message
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
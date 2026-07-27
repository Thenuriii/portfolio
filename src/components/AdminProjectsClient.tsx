"use client";

import { useState } from "react";
import { saveProject, deleteProject } from "@/app/admin/actions";
import { type Project } from "@/lib/queries";
import { upload } from "@vercel/blob/client";

interface AdminProjectsClientProps {
  initialProjects: Project[];
}

export default function AdminProjectsClient({ initialProjects }: AdminProjectsClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [mainImageUploading, setMainImageUploading] = useState(false);
  const [screenshotsUploading, setScreenshotsUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleEdit = (project: Project) => {
    setEditingProject({
      ...project,
      tech: [...(project.tech || [])],
      screenshots: [...(project.screenshots || [])]
    });
  };

  const handleCreateNew = () => {
    setEditingProject({
      title: "",
      category: "",
      image_url: "",
      description: "",
      github_url: "",
      live_url: "",
      video_url: "",
      featured: false,
      order: 0,
      layout: "default",
      image_side: "left",
      tech: [],
      screenshots: []
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? All associated media will be deleted from Vercel Blob storage.")) {
      return;
    }

    try {
      await deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
      alert("Project deleted successfully.");
    } catch (err) {
      alert("Error deleting project: " + (err as Error).message);
    }
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMainImageUploading(true);
    try {
      const newBlob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/studio/upload",
      });
      setEditingProject((prev) => prev ? { ...prev, image_url: newBlob.url } : null);
    } catch (err) {
      alert("Failed to upload image: " + (err as Error).message);
    } finally {
      setMainImageUploading(false);
    }
  };

  const handleScreenshotsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setScreenshotsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const newBlob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/studio/upload",
        });
        uploadedUrls.push(newBlob.url);
      }
      setEditingProject((prev) => 
        prev ? { ...prev, screenshots: [...(prev.screenshots || []), ...uploadedUrls] } : null
      );
    } catch (err) {
      alert("Failed to upload one or more screenshots: " + (err as Error).message);
    } finally {
      setScreenshotsUploading(false);
    }
  };

  const removeScreenshot = (indexToRemove: number) => {
    setEditingProject((prev) => {
      if (!prev || !prev.screenshots) return prev;
      return {
        ...prev,
        screenshots: prev.screenshots.filter((_, idx) => idx !== indexToRemove)
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setSaving(true);
    try {
      const payload = {
        id: editingProject.id,
        title: editingProject.title || "Untitled",
        category: editingProject.category || "General",
        image_url: editingProject.image_url || "",
        description: editingProject.description || "",
        github_url: editingProject.github_url || "",
        live_url: editingProject.live_url || "",
        video_url: editingProject.video_url || "",
        featured: !!editingProject.featured,
        order: Number(editingProject.order || 0),
        layout: editingProject.layout || "default",
        image_side: editingProject.image_side || "left",
        tech: editingProject.tech || [],
        screenshots: editingProject.screenshots || [],
      };

      await saveProject(payload);
      
      // Refresh the page data local list (normally router.refresh() handles this, but updating local state is faster)
      // If we saved an existing item, replace it, else push dummy item to trigger refresh
      window.location.reload();
    } catch (err) {
      alert("Error saving project: " + (err as Error).message);
      setSaving(false);
    }
  };

  const handleTechChange = (text: string) => {
    const list = text.split(",").map(t => t.trim()).filter(Boolean);
    setEditingProject((prev) => prev ? { ...prev, tech: list } : null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {editingProject ? (
        <form onSubmit={handleSave} className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 pb-2 border-b border-gray-100">
            {editingProject.id ? "Edit Project" : "Create New Project"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Project Title</label>
              <input
                type="text"
                required
                value={editingProject.title}
                onChange={(e) => setEditingProject((prev) => prev ? { ...prev, title: e.target.value } : null)}
                placeholder="e.g. Movie Matrix"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
              <input
                type="text"
                required
                value={editingProject.category}
                onChange={(e) => setEditingProject((prev) => prev ? { ...prev, category: e.target.value } : null)}
                placeholder="e.g. Web App"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
            <textarea
              rows={4}
              required
              value={editingProject.description}
              onChange={(e) => setEditingProject((prev) => prev ? { ...prev, description: e.target.value } : null)}
              placeholder="Detailed description of the project..."
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">GitHub URL</label>
              <input
                type="url"
                value={editingProject.github_url}
                onChange={(e) => setEditingProject((prev) => prev ? { ...prev, github_url: e.target.value } : null)}
                placeholder="https://github.com/..."
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Live URL</label>
              <input
                type="url"
                value={editingProject.live_url}
                onChange={(e) => setEditingProject((prev) => prev ? { ...prev, live_url: e.target.value } : null)}
                placeholder="https://..."
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Video Demo URL</label>
              <input
                type="url"
                value={editingProject.video_url}
                onChange={(e) => setEditingProject((prev) => prev ? { ...prev, video_url: e.target.value } : null)}
                placeholder="https://youtube.com/..."
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Sort Order</label>
              <input
                type="number"
                value={editingProject.order}
                onChange={(e) => setEditingProject((prev) => prev ? { ...prev, order: Number(e.target.value) } : null)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Layout</label>
              <select
                value={editingProject.layout}
                onChange={(e) => setEditingProject((prev) => prev ? { ...prev, layout: e.target.value } : null)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
              >
                <option value="default">Default</option>
                <option value="featured">Featured Large</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Image Side</label>
              <select
                value={editingProject.image_side}
                onChange={(e) => setEditingProject((prev) => prev ? { ...prev, image_side: e.target.value } : null)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <input
                type="checkbox"
                id="featured"
                checked={editingProject.featured}
                onChange={(e) => setEditingProject((prev) => prev ? { ...prev, featured: e.target.checked } : null)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="featured" className="ml-2 text-sm font-bold text-gray-700 uppercase cursor-pointer">
                Featured Project
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Tech Stack (Comma Separated)
            </label>
            <input
              type="text"
              value={editingProject.tech?.join(", ") || ""}
              onChange={(e) => handleTechChange(e.target.value)}
              placeholder="Next.js, Tailwind CSS, TypeScript"
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Main Image upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase">Main Project Image</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
                disabled={mainImageUploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
              />
              {mainImageUploading && <span className="text-xs text-purple-600 animate-pulse">Uploading file...</span>}
            </div>
            {editingProject.image_url && (
              <div className="mt-2 relative w-40 h-24 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <img src={editingProject.image_url} alt="Main Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Screenshots upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase">Project Screenshots (Multiple)</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleScreenshotsChange}
                disabled={screenshotsUploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
              />
              {screenshotsUploading && <span className="text-xs text-purple-600 animate-pulse">Uploading files...</span>}
            </div>
            {editingProject.screenshots && editingProject.screenshots.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                {editingProject.screenshots.map((url, idx) => (
                  <div key={idx} className="relative w-full h-24 border border-gray-200 rounded-xl overflow-hidden shadow-sm group">
                    <img src={url} alt={`Screenshot ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(idx)}
                      className="absolute top-1 right-1 bg-red-650 text-white rounded-full p-1 opacity-80 hover:opacity-100 hover:scale-105 shadow"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setEditingProject(null)}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || mainImageUploading || screenshotsUploading}
              className="px-5 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? "Saving Project..." : "Save Project"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Project List</h2>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              + New Project
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase tracking-wider text-xs">
                  <th className="p-4">Thumbnail</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        {project.image_url ? (
                          <div className="w-16 h-10 border border-gray-250 rounded-lg overflow-hidden shadow-inner bg-gray-100">
                            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No image</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold">{project.title}</td>
                      <td className="p-4 text-xs font-mono">{project.category}</td>
                      <td className="p-4 space-x-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-purple-650 hover:text-purple-800 font-semibold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-red-650 hover:text-red-800 font-semibold hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500 italic">
                      No projects found in database. Create one above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

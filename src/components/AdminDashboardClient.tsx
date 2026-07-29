"use client";

import { useState } from "react";
import { saveHeroData, saveCertificate, deleteCertificate, uploadFileAction } from "@/app/admin/actions";
import { type HeroData, type Certificate } from "@/lib/queries";
import { getPublicUrl } from "@/lib/utils";

interface AdminDashboardClientProps {
  hero: HeroData | null;
  certificates: Certificate[];
  stats: {
    projectsCount: number;
    skillsCount: number;
  };
}

export default function AdminDashboardClient({ hero, certificates, stats }: AdminDashboardClientProps) {
  // Hero State
  const [jobStatus, setJobStatus] = useState(hero?.job_status || "");
  const [profileImageUrl, setProfileImageUrl] = useState(hero?.profile_image_url || "");
  const [cvUrl, setCvUrl] = useState(hero?.cv_url || "");
  const [heroSaving, setHeroSaving] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);

  // Certificates State
  const [editingCert, setEditingCert] = useState<Partial<Certificate> | null>(null);
  const [certImageUploading, setCertImageUploading] = useState(false);
  const [certSaving, setCertSaving] = useState(false);

  // Hero form submission
  const handleHeroSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setHeroSaving(true);
    try {
      await saveHeroData({
        job_status: jobStatus,
        profile_image_url: profileImageUrl,
        cv_url: cvUrl
      });
      alert("Hero settings saved successfully.");
      window.location.reload();
    } catch (err) {
      alert("Error saving hero settings: " + (err as Error).message);
    } finally {
      setHeroSaving(false);
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadFileAction(formData);
      setProfileImageUrl(res.url);
    } catch (err) {
      alert("Failed to upload profile picture: " + (err as Error).message);
    } finally {
      setProfileUploading(false);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadFileAction(formData);
      setCvUrl(res.url);
    } catch (err) {
      alert("Failed to upload CV document: " + (err as Error).message);
    } finally {
      setCvUploading(false);
    }
  };

  // Certificate operations
  const handleCertEdit = (cert: Certificate) => {
    setEditingCert({ ...cert });
  };

  const handleCertCreateNew = () => {
    setEditingCert({
      title: "",
      issued_by: "",
      image_url: ""
    });
  };

  const handleCertDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate? The image will be deleted from Vercel Blob storage.")) {
      return;
    }

    try {
      await deleteCertificate(id);
      alert("Certificate deleted successfully.");
      window.location.reload();
    } catch (err) {
      alert("Error deleting certificate: " + (err as Error).message);
    }
  };

  const handleCertImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCertImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadFileAction(formData);
      setEditingCert((prev) => prev ? { ...prev, image_url: res.url } : null);
    } catch (err) {
      alert("Failed to upload certificate image: " + (err as Error).message);
    } finally {
      setCertImageUploading(false);
    }
  };

  const handleCertSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;

    setCertSaving(true);
    try {
      const payload = {
        id: editingCert.id,
        title: editingCert.title || "Untitled",
        issued_by: editingCert.issued_by || "Unknown Issuer",
        image_url: editingCert.image_url || ""
      };

      await saveCertificate(payload);
      alert("Certificate saved successfully.");
      setEditingCert(null);
      window.location.reload();
    } catch (err) {
      alert("Error saving certificate: " + (err as Error).message);
    } finally {
      setCertSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stat block */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Projects</h2>
          <p className="text-3xl font-extrabold mt-2 text-purple-650">{stats.projectsCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Skills Listed</h2>
          <p className="text-3xl font-extrabold mt-2 text-purple-650">{stats.skillsCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Certificates</h2>
          <p className="text-3xl font-extrabold mt-2 text-purple-650">{certificates.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Hero Form */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-800 pb-2 border-b border-gray-100">Hero Section</h2>
          <form onSubmit={handleHeroSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Job Status / Headline</label>
              <input
                type="text"
                required
                value={jobStatus}
                onChange={(e) => setJobStatus(e.target.value)}
                placeholder="e.g. MIS Undergraduate & UI/UX Enthusiast"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Profile image upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase">Profile Picture</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileUpload}
                  disabled={profileUploading}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
                />
                {profileUploading && <span className="text-[10px] text-purple-600 animate-pulse">Uploading...</span>}
              </div>
              {profileImageUrl && (
                <div className="relative w-20 h-20 rounded-full border border-gray-200 overflow-hidden shadow-inner mt-2">
                  <img src={getPublicUrl(profileImageUrl)} alt="Profile Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* CV upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase">CV Document (PDF)</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleCvUpload}
                  disabled={cvUploading}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
                />
                {cvUploading && <span className="text-[10px] text-purple-600 animate-pulse">Uploading...</span>}
              </div>
              {cvUrl && (
                <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <a href={getPublicUrl(cvUrl)} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-650 hover:underline font-medium truncate">
                    View Uploaded CV Document
                  </a>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={heroSaving || profileUploading || cvUploading}
              className="w-full py-2.5 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {heroSaving ? "Saving Settings..." : "Save Hero Settings"}
            </button>
          </form>
        </div>

        {/* Certificates Form & List */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
          {editingCert ? (
            <form onSubmit={handleCertSave} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 pb-2 border-b border-gray-100">
                {editingCert.id ? "Edit Certificate" : "New Certificate"}
              </h2>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Certificate Title</label>
                <input
                  type="text"
                  required
                  value={editingCert.title}
                  onChange={(e) => setEditingCert((prev) => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="e.g. AWS Cloud Practitioner"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Issued By / Platform</label>
                <input
                  type="text"
                  required
                  value={editingCert.issued_by}
                  onChange={(e) => setEditingCert((prev) => prev ? { ...prev, issued_by: e.target.value } : null)}
                  placeholder="e.g. Amazon Web Services"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase">Credential Image Badge</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCertImageUpload}
                    disabled={certImageUploading}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
                  />
                  {certImageUploading && <span className="text-[10px] text-purple-600 animate-pulse">Uploading...</span>}
                </div>
                {editingCert.image_url && (
                  <div className="relative w-16 h-16 border border-gray-200 rounded overflow-hidden shadow-sm mt-2">
                    <img src={getPublicUrl(editingCert.image_url)} alt="Badge Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingCert(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={certSaving || certImageUploading}
                  className="px-5 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {certSaving ? "Saving..." : "Save Certificate"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Certificates</h2>
                <button
                  onClick={handleCertCreateNew}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  + Add New
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase tracking-wider text-xs">
                      <th className="p-3">Badge</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Issuer</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {certificates.length > 0 ? (
                      certificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3">
                            {cert.image_url ? (
                              <div className="w-10 h-10 border border-gray-200 rounded overflow-hidden">
                                <img src={getPublicUrl(cert.image_url)} alt={cert.title} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">No image</span>
                            )}
                          </td>
                          <td className="p-3 font-semibold text-xs sm:text-sm">{cert.title}</td>
                          <td className="p-3 text-xs">{cert.issued_by}</td>
                          <td className="p-3 space-x-2">
                            <button
                              onClick={() => handleCertEdit(cert)}
                              className="text-purple-650 hover:text-purple-800 font-semibold hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleCertDelete(cert.id)}
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
                          No certificates uploaded yet. Add one above!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { upload } from "@vercel/blob/client";
import { auth } from "@/lib/firebaseClient";
import { authedFetch } from "@/lib/studioFetch";
import { getPublicUrl } from "@/lib/utils";
import AdminSidebar from "@/components/AdminSidebar";
import {
  type HeroData,
  type Certificate,
  type CoreTechItem,
  type Education,
  type CoreCurriculumItem,
  type Project,
  type SkillCategory,
  type SkillItem,
  type AboutStat,
  type AboutFocus
} from "@/lib/queries";

interface AdminDashboardClientProps {
  hero: HeroData | null;
  certificates: Certificate[];
  stats: { projectsCount: number; skillsCount: number };
  coreTech: CoreTechItem[];
  education: Education[];
  curriculum: CoreCurriculumItem[];
  aboutStats: AboutStat[];
  aboutFocus: AboutFocus[];
  projects: Project[];
  skills: SkillCategory[];
}

interface StatusMsg {
  text: string;
  type: "success" | "error";
}

export default function AdminDashboardClient(props: AdminDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("hero");
  const [authLoading, setAuthLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<StatusMsg | null>(null);

  // Authentication Gate
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login");
      } else {
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const showStatus = (text: string, type: "success" | "error" = "success") => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Helper for direct client uploads to Vercel Blob
  const handleClientUpload = async (file: File): Promise<string> => {
    const token = await auth.currentUser?.getIdToken(true);
    if (!token) throw new Error("Authentication token is missing. Please re-login.");

    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/studio/upload",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return blob.url;
  };

  // ----------------------------------------------------
  // Module 1: Hero Data States & Handlers
  // ----------------------------------------------------
  const [jobStatus, setJobStatus] = useState(props.hero?.job_status || "");
  const [profileImageUrl, setProfileImageUrl] = useState(props.hero?.profile_image_url || "");
  const [cvUrl, setCvUrl] = useState(props.hero?.cv_url || "");
  const [heroSaving, setHeroSaving] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);

  const handleHeroSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobStatus.trim()) {
      showStatus("Job status is required.", "error");
      return;
    }
    setHeroSaving(true);
    try {
      const res = await authedFetch("/api/studio/hero", {
        method: "POST",
        body: JSON.stringify({
          data: {
            job_status: jobStatus.trim(),
            profile_image_url: profileImageUrl,
            cv_url: cvUrl
          }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showStatus("Hero details saved successfully!");
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setHeroSaving(false);
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileUploading(true);
    try {
      const url = await handleClientUpload(file);
      setProfileImageUrl(url);
      showStatus("Profile picture uploaded successfully!");
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setProfileUploading(false);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvUploading(true);
    try {
      const url = await handleClientUpload(file);
      setCvUrl(url);
      showStatus("CV document uploaded successfully!");
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setCvUploading(false);
    }
  };

  const handleDeleteProfileImage = async () => {
    if (!confirm("Are you sure you want to delete your profile image?")) return;
    try {
      const res = await authedFetch("/api/studio/hero", {
        method: "POST",
        body: JSON.stringify({ action: "deleteProfileImage" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setProfileImageUrl("");
      showStatus("Profile image deleted from storage.");
    } catch (err: any) {
      showStatus(err.message, "error");
    }
  };

  const handleDeleteCV = async () => {
    if (!confirm("Are you sure you want to delete your CV document?")) return;
    try {
      const res = await authedFetch("/api/studio/hero", {
        method: "POST",
        body: JSON.stringify({ action: "deleteCV" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setCvUrl("");
      showStatus("CV document deleted from storage.");
    } catch (err: any) {
      showStatus(err.message, "error");
    }
  };

  // ----------------------------------------------------
  // Module 2: Projects States & Handlers
  // ----------------------------------------------------
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectImageUploading, setProjectImageUploading] = useState(false);
  const [projectVideoUploading, setProjectVideoUploading] = useState(false);
  const [screenshotUploading, setScreenshotUploading] = useState(false);

  const startNewProject = () => {
    // Alternating image_side logic for new project
    const fullWidthProjectsCount = props.projects.filter(p => p.layout === "full").length;
    const initialSide = fullWidthProjectsCount % 2 === 0 ? "left" : "right";

    setEditingProject({
      title: "",
      category: "DEVELOPMENT",
      image_url: "",
      description: "",
      github_url: "",
      live_url: "",
      video_url: "",
      featured: false,
      order: props.projects.length + 1,
      layout: "half",
      image_side: initialSide,
      tech: [],
      screenshots: []
    });
  };

  const handleProjectSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    if (!editingProject.title?.trim() || !editingProject.category?.trim()) {
      showStatus("Title and Category are required.", "error");
      return;
    }
    setProjectSaving(true);
    try {
      const res = await authedFetch("/api/studio/projects", {
        method: "POST",
        body: JSON.stringify({
          id: editingProject.id,
          data: editingProject
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showStatus("Project saved successfully!");
      router.refresh();
      setEditingProject(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setProjectSaving(false);
    }
  };

  const handleProjectDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? All associated Vercel Blob assets will be deleted too.")) return;
    try {
      const res = await authedFetch("/api/studio/projects", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      showStatus("Project deleted successfully!");
      router.refresh();
      if (editingProject?.id === id) setEditingProject(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    }
  };

  const handleProjectMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;
    setProjectImageUploading(true);
    try {
      const url = await handleClientUpload(file);
      setEditingProject(prev => prev ? { ...prev, image_url: url } : null);
      showStatus("Main project image uploaded!");
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setProjectImageUploading(false);
    }
  };

  const handleProjectVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;
    setProjectVideoUploading(true);
    try {
      const url = await handleClientUpload(file);
      setEditingProject(prev => prev ? { ...prev, video_url: url } : null);
      showStatus("Project video uploaded!");
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setProjectVideoUploading(false);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProject) return;
    setScreenshotUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await handleClientUpload(files[i]);
        uploadedUrls.push(url);
      }
      setEditingProject(prev => {
        if (!prev) return null;
        const currentScreenshots = prev.screenshots || [];
        return {
          ...prev,
          screenshots: [...currentScreenshots, ...uploadedUrls]
        };
      });
      showStatus("Screenshots uploaded successfully!");
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setScreenshotUploading(false);
    }
  };

  const removeScreenshot = (index: number) => {
    if (!editingProject) return;
    setEditingProject(prev => {
      if (!prev) return null;
      const current = [...(prev.screenshots || [])];
      current.splice(index, 1);
      return { ...prev, screenshots: current };
    });
  };

  // ----------------------------------------------------
  // Module 3: Skills States & Handlers
  // ----------------------------------------------------
  const [editingCategory, setEditingCategory] = useState<Partial<SkillCategory> | null>(null);
  const [editingSkillItem, setEditingSkillItem] = useState<Partial<SkillItem> | null>(null);
  const [skillSaving, setSkillSaving] = useState(false);

  const startNewSkillCategory = () => {
    setEditingCategory({
      title: "",
      icon: "",
      featured: false,
      size: 1
    });
  };

  const handleCategorySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editingCategory.title?.trim()) {
      showStatus("Category title is required.", "error");
      return;
    }
    setSkillSaving(true);
    try {
      const res = await authedFetch("/api/studio/skills", {
        method: "POST",
        body: JSON.stringify({
          type: "category",
          id: editingCategory.id,
          data: editingCategory
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showStatus("Skill Category saved!");
      router.refresh();
      setEditingCategory(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setSkillSaving(false);
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Category and ALL its skill list items?")) return;
    try {
      const res = await authedFetch("/api/studio/skills", {
        method: "POST",
        body: JSON.stringify({ action: "deleteCategory", id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      showStatus("Category deleted successfully!");
      router.refresh();
      if (editingCategory?.id === id) setEditingCategory(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    }
  };

  const startNewSkillItem = (catId: string) => {
    setEditingSkillItem({
      category_id: catId,
      name: ""
    });
  };

  const handleSkillItemSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkillItem) return;
    if (!editingSkillItem.name?.trim()) {
      showStatus("Skill Item name is required.", "error");
      return;
    }
    setSkillSaving(true);
    try {
      const res = await authedFetch("/api/studio/skills", {
        method: "POST",
        body: JSON.stringify({
          type: "item",
          id: editingSkillItem.id,
          data: editingSkillItem
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showStatus("Skill Item added!");
      router.refresh();
      setEditingSkillItem(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setSkillSaving(false);
    }
  };

  const handleSkillItemDelete = async (itemId: string) => {
    if (!confirm("Delete this skill item?")) return;
    try {
      const res = await authedFetch("/api/studio/skills", {
        method: "POST",
        body: JSON.stringify({ action: "deleteItem", id: itemId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      showStatus("Item deleted.");
      router.refresh();
    } catch (err: any) {
      showStatus(err.message, "error");
    }
  };

  // ----------------------------------------------------
  // Module 4: About Stats States & Handlers
  // ----------------------------------------------------
  const [editingStat, setEditingStat] = useState<Partial<AboutStat> | null>(null);
  const [editingTech, setEditingTech] = useState<Partial<CoreTechItem> | null>(null);
  const [statSaving, setStatSaving] = useState(false);

  const startNewStat = () => {
    setEditingStat({
      value: "",
      label: "",
      color: "purple",
      order: props.aboutStats.length + 1
    });
  };

  const startNewTech = () => {
    setEditingTech({
      name: "",
      order: props.coreTech.length + 1
    });
  };

  const handleStatSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStat) return;
    if (!editingStat.value?.trim() || !editingStat.label?.trim()) {
      showStatus("Value and Label are required.", "error");
      return;
    }
    setStatSaving(true);
    try {
      const res = await authedFetch("/api/studio/about", {
        method: "POST",
        body: JSON.stringify({
          type: "stat",
          id: editingStat.id,
          data: editingStat
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showStatus("Stat item saved successfully!");
      router.refresh();
      setEditingStat(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setStatSaving(false);
    }
  };

  const handleStatDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this statistic counter?")) return;
    try {
      const res = await authedFetch("/api/studio/about", {
        method: "POST",
        body: JSON.stringify({ action: "deleteStat", id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      showStatus("Stat deleted successfully!");
      router.refresh();
      if (editingStat?.id === id) setEditingStat(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    }
  };

  const handleTechSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTech) return;
    if (!editingTech.name?.trim()) {
      showStatus("Tech item name is required.", "error");
      return;
    }
    setStatSaving(true);
    try {
      const res = await authedFetch("/api/studio/about", {
        method: "POST",
        body: JSON.stringify({
          type: "tech",
          id: editingTech.id,
          data: editingTech
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showStatus("Tech stack item saved!");
      router.refresh();
      setEditingTech(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setStatSaving(false);
    }
  };

  const handleTechDelete = async (id: string) => {
    if (!confirm("Delete this tech item?")) return;
    try {
      const res = await authedFetch("/api/studio/about", {
        method: "POST",
        body: JSON.stringify({ action: "deleteTech", id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      showStatus("Tech item deleted.");
      router.refresh();
      if (editingTech?.id === id) setEditingTech(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    }
  };

  const handleTechMove = async (index: number, direction: "up" | "down") => {
    const list = [...props.coreTech];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap order values
    const tempOrder = list[index].order;
    list[index].order = list[targetIndex].order;
    list[targetIndex].order = tempOrder;

    try {
      const payload = list.map(item => ({ id: item.id, order: item.order }));
      const res = await authedFetch("/api/studio/about", {
        method: "POST",
        body: JSON.stringify({
          type: "reorderTech",
          data: payload
        })
      });
      if (!res.ok) throw new Error("Swap failed");
      router.refresh();
    } catch (err: any) {
      showStatus(err.message, "error");
    }
  };

  // ----------------------------------------------------
  // Module 5: About Focus States & Handlers
  // ----------------------------------------------------
  const [editingFocus, setEditingFocus] = useState<Partial<AboutFocus> | null>(null);
  const [focusSaving, setFocusSaving] = useState(false);

  const startNewFocus = () => {
    setEditingFocus({
      item: "",
      order: props.aboutFocus.length + 1
    });
  };

  const handleFocusSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFocus) return;
    if (!editingFocus.item?.trim()) {
      showStatus("Bio paragraph text is required.", "error");
      return;
    }
    setFocusSaving(true);
    try {
      const res = await authedFetch("/api/studio/about-focus", {
        method: "POST",
        body: JSON.stringify({
          id: editingFocus.id,
          data: editingFocus
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showStatus("Bio focus item saved!");
      router.refresh();
      setEditingFocus(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setFocusSaving(false);
    }
  };

  const handleFocusDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this paragraph?")) return;
    try {
      const res = await authedFetch("/api/studio/about-focus", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      showStatus("Paragraph deleted.");
      router.refresh();
      if (editingFocus?.id === id) setEditingFocus(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    }
  };

  // ----------------------------------------------------
  // Module 6: Education States & Handlers
  // ----------------------------------------------------
  const [editingEdu, setEditingEdu] = useState<Partial<Education> | null>(null);
  const [eduSaving, setEduSaving] = useState(false);

  const startNewEdu = () => {
    setEditingEdu({
      degree: "",
      institution: "",
      order: props.education.length + 1
    });
  };

  const handleEduSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdu) return;
    if (!editingEdu.degree?.trim() || !editingEdu.institution?.trim()) {
      showStatus("Degree and Institution are required.", "error");
      return;
    }
    setEduSaving(true);
    try {
      const res = await authedFetch("/api/studio/education", {
        method: "POST",
        body: JSON.stringify({
          type: "education",
          id: editingEdu.id,
          data: editingEdu
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showStatus("Education history saved successfully!");
      router.refresh();
      setEditingEdu(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setEduSaving(false);
    }
  };

  const handleEduDelete = async (id: string) => {
    if (!confirm("Delete this education record?")) return;
    try {
      const res = await authedFetch("/api/studio/education", {
        method: "POST",
        body: JSON.stringify({ action: "deleteEducation", id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      showStatus("Record deleted.");
      router.refresh();
      if (editingEdu?.id === id) setEditingEdu(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    }
  };

  // ----------------------------------------------------
  // Module 7: Certificates States & Handlers
  // ----------------------------------------------------
  const [editingCert, setEditingCert] = useState<Partial<Certificate> | null>(null);
  const [certSaving, setCertSaving] = useState(false);
  const [certUploading, setCertUploading] = useState(false);

  const startNewCert = () => {
    setEditingCert({
      title: "",
      issued_by: "",
      image_url: ""
    });
  };

  const handleCertImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCert) return;
    setCertUploading(true);
    try {
      const url = await handleClientUpload(file);
      setEditingCert(prev => prev ? { ...prev, image_url: url } : null);
      showStatus("Certificate credential image badge uploaded!");
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setCertUploading(false);
    }
  };

  const handleCertSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;
    if (!editingCert.title?.trim() || !editingCert.issued_by?.trim()) {
      showStatus("Title and Issuer are required.", "error");
      return;
    }
    setCertSaving(true);
    try {
      const res = await authedFetch("/api/studio/certificate", {
        method: "POST",
        body: JSON.stringify({
          id: editingCert.id,
          data: editingCert
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showStatus("Certificate saved successfully!");
      router.refresh();
      setEditingCert(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setCertSaving(false);
    }
  };

  const handleCertDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certification? Old Vercel Blob badge image will be deleted too.")) return;
    try {
      const res = await authedFetch("/api/studio/certificate", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      showStatus("Certificate deleted.");
      router.refresh();
      if (editingCert?.id === id) setEditingCert(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    }
  };

  // ----------------------------------------------------
  // Module 8: Core Curriculum States & Handlers
  // ----------------------------------------------------
  const [editingCurriculum, setEditingCurriculum] = useState<Partial<CoreCurriculumItem> | null>(null);
  const [curriculumSaving, setCurriculumSaving] = useState(false);

  const startNewCurriculum = () => {
    setEditingCurriculum({
      title: "",
      description: "",
      order: props.curriculum.length + 1
    });
  };

  const handleCurriculumSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCurriculum) return;
    if (!editingCurriculum.title?.trim() || !editingCurriculum.description?.trim()) {
      showStatus("Title and Description are required.", "error");
      return;
    }
    setCurriculumSaving(true);
    try {
      const res = await authedFetch("/api/studio/education", {
        method: "POST",
        body: JSON.stringify({
          type: "curriculum",
          id: editingCurriculum.id,
          data: editingCurriculum
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showStatus("Curriculum course saved!");
      router.refresh();
      setEditingCurriculum(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setCurriculumSaving(false);
    }
  };

  const handleCurriculumDelete = async (id: string) => {
    if (!confirm("Delete this curriculum topic?")) return;
    try {
      const res = await authedFetch("/api/studio/education", {
        method: "POST",
        body: JSON.stringify({ action: "deleteCurriculum", id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      showStatus("Curriculum topic removed.");
      router.refresh();
      if (editingCurriculum?.id === id) setEditingCurriculum(null);
    } catch (err: any) {
      showStatus(err.message, "error");
    }
  };

  // ----------------------------------------------------
  // Layout rendering and UI Tab Switches
  // ----------------------------------------------------
  if (authLoading) {
    return (
      <div className="flex-1 min-h-screen bg-[#0b0813] flex flex-col items-center justify-center text-purple-400">
        <div className="w-10 h-10 border-4 border-t-purple-500 border-purple-500/20 rounded-full animate-spin mb-4" />
        <span className="text-xs font-mono tracking-widest uppercase">Validating Session...</span>
      </div>
    );
  }

  return (
    <>
      <AdminSidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setStatusMsg(null); }} />

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-screen relative">
        {/* Status Msg notification bar */}
        {statusMsg && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl border text-xs font-semibold shadow-2xl transition-all animate-bounce ${
            statusMsg.type === "success"
              ? "bg-purple-950/90 border-purple-500/40 text-purple-200"
              : "bg-red-950/90 border-red-500/40 text-red-200"
          }`}>
            {statusMsg.type === "success" ? "✓" : "⚠️"} {statusMsg.text}
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-6 border-b border-purple-500/10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight capitalize">
              {activeTab.replace("-", " ")} Manager
            </h1>
            <p className="text-xs text-purple-300/50 mt-1 font-mono">
              Live updates directly synced to public portfolio
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Tab 1: Hero Settings */}
        {/* ---------------------------------------------------- */}
        {activeTab === "hero" && (
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Form */}
            <div className="xl:w-1/2 bg-[#130f24] border border-purple-500/15 p-6 rounded-2xl space-y-6">
              <form onSubmit={handleHeroSave} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Job Status Badge</label>
                  <input
                    type="text"
                    required
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value)}
                    placeholder="e.g. Available for Freelance"
                    className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">Profile Image</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileUpload}
                      disabled={profileUploading}
                      className="block w-full text-xs text-purple-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-purple-950/40 file:text-purple-300 hover:file:bg-purple-900/40 disabled:opacity-50"
                    />
                    {profileUploading && <span className="text-[10px] text-purple-400 animate-pulse font-mono">Uploading...</span>}
                  </div>
                  {profileImageUrl && (
                    <div className="flex items-center gap-3 mt-3">
                      <div className="relative w-16 h-16 rounded-full border border-purple-500/30 overflow-hidden">
                        <img src={getPublicUrl(profileImageUrl)} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={handleDeleteProfileImage}
                        className="px-3 py-1 bg-red-950/40 hover:bg-red-900/40 text-red-200 border border-red-500/20 text-[10px] rounded-lg transition-colors cursor-pointer"
                      >
                        Remove Profile Image
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">CV document (PDF)</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleCvUpload}
                      disabled={cvUploading}
                      className="block w-full text-xs text-purple-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-purple-950/40 file:text-purple-300 hover:file:bg-purple-900/40 disabled:opacity-50"
                    />
                    {cvUploading && <span className="text-[10px] text-purple-400 animate-pulse font-mono">Uploading...</span>}
                  </div>
                  {cvUrl && (
                    <div className="flex items-center gap-3 mt-3">
                      <a href={getPublicUrl(cvUrl)} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-300 hover:underline font-mono">
                        📄 View CV Document
                      </a>
                      <button
                        type="button"
                        onClick={handleDeleteCV}
                        className="px-3 py-1 bg-red-950/40 hover:bg-red-900/40 text-red-200 border border-red-500/20 text-[10px] rounded-lg transition-colors cursor-pointer"
                      >
                        Remove CV
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={heroSaving || profileUploading || cvUploading}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  {heroSaving ? "Saving Settings..." : "Save Hero Settings"}
                </button>
              </form>
            </div>

            {/* Live Preview */}
            <div className="xl:w-1/2 bg-[#130f24]/30 border border-purple-500/10 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
              <span className="text-[10px] uppercase font-mono text-purple-300/40 mb-6">Interactive Live Preview</span>
              <div className="max-w-md w-full bg-[#1c1830] border border-purple-500/20 p-6 rounded-2xl text-center space-y-4 shadow-xl">
                <div className="w-24 h-24 rounded-full border-2 border-purple-500/30 overflow-hidden mx-auto shadow-inner bg-purple-900/10">
                  {profileImageUrl ? (
                    <img src={getPublicUrl(profileImageUrl)} alt="Preview Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-300 font-mono text-xs">No Image</div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Nimsara</h3>
                  <p className="text-xs text-purple-300/60 font-mono mt-1">Full Stack Developer</p>
                </div>
                {jobStatus && (
                  <span className="inline-block bg-purple-500/10 border border-purple-500/25 px-3 py-1 rounded-full text-[10px] font-bold text-purple-300 uppercase tracking-wider font-mono">
                    🟢 {jobStatus}
                  </span>
                )}
                <div className="pt-2">
                  {cvUrl ? (
                    <a
                      href={getPublicUrl(cvUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/30 rounded-xl text-xs font-semibold text-purple-300"
                    >
                      Download CV document
                    </a>
                  ) : (
                    <span className="text-[10px] text-purple-300/40 italic">No CV document loaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* Tab 2: Projects Settings */}
        {/* ---------------------------------------------------- */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            {/* Chips List */}
            <div className="bg-[#130f24] border border-purple-500/15 p-5 rounded-2xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">Saved Projects ({props.projects.length})</h3>
                <button
                  onClick={startNewProject}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
                >
                  + Add New Project
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {props.projects.length === 0 ? (
                  <p className="text-xs text-purple-300/40 italic">No projects saved. Click + Add New Project to begin.</p>
                ) : (
                  props.projects.map(p => (
                    <div
                      key={p.id}
                      className={`group relative flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                        editingProject?.id === p.id
                          ? "bg-purple-600 border-purple-400 text-white"
                          : "bg-[#1c1830]/60 border-purple-500/20 text-purple-200 hover:border-purple-500/45"
                      }`}
                    >
                      <span onClick={() => setEditingProject({ ...p })}>{p.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectDelete(p.id);
                        }}
                        className="w-4 h-4 rounded-full bg-red-950/50 hover:bg-red-600 text-red-200 hover:text-white flex items-center justify-center text-[8px] transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {editingProject && (
              <div className="flex flex-col xl:flex-row gap-6">
                {/* Form */}
                <div className="xl:w-1/2 bg-[#130f24] border border-purple-500/15 p-6 rounded-2xl space-y-6">
                  <h3 className="text-sm font-bold text-purple-200 border-b border-purple-500/10 pb-3 font-mono">
                    {editingProject.id ? `Editing "${editingProject.title}"` : "Create New Project"}
                  </h3>
                  <form onSubmit={handleProjectSave} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Project Title</label>
                        <input
                          type="text"
                          required
                          value={editingProject.title || ""}
                          onChange={(e) => setEditingProject(prev => prev ? { ...prev, title: e.target.value } : null)}
                          placeholder="e.g. E-Commerce Platform"
                          className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Category</label>
                        <select
                          value={editingProject.category || "DEVELOPMENT"}
                          onChange={(e) => setEditingProject(prev => prev ? { ...prev, category: e.target.value } : null)}
                          className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="DEVELOPMENT">Development</option>
                          <option value="DESIGN">Design</option>
                          <option value="CLONE">Clone</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Description</label>
                      <textarea
                        required
                        rows={3}
                        value={editingProject.description || ""}
                        onChange={(e) => setEditingProject(prev => prev ? { ...prev, description: e.target.value } : null)}
                        placeholder="Project synopsis..."
                        className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">
                          {editingProject.category?.toUpperCase() === "DESIGN" ? "Figma URL" : "GitHub URL"}
                        </label>
                        <input
                          type="url"
                          value={editingProject.github_url || ""}
                          onChange={(e) => setEditingProject(prev => prev ? { ...prev, github_url: e.target.value } : null)}
                          placeholder="https://..."
                          className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Live Site URL</label>
                        <input
                          type="url"
                          value={editingProject.live_url || ""}
                          onChange={(e) => setEditingProject(prev => prev ? { ...prev, live_url: e.target.value } : null)}
                          placeholder="https://..."
                          className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Layout Size</label>
                        <select
                          value={editingProject.layout || "half"}
                          onChange={(e) => setEditingProject(prev => prev ? { ...prev, layout: e.target.value } : null)}
                          className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="full">Full Width</option>
                          <option value="half">Half Width</option>
                          <option value="third">One Third</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Image Side</label>
                        <select
                          disabled={editingProject.layout !== "full"}
                          value={editingProject.image_side || "left"}
                          onChange={(e) => setEditingProject(prev => prev ? { ...prev, image_side: e.target.value } : null)}
                          className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-2 py-2 text-xs text-white focus:outline-none disabled:opacity-50"
                        >
                          <option value="left">Left Side</option>
                          <option value="right">Right Side</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Order</label>
                        <input
                          type="number"
                          value={editingProject.order || 0}
                          onChange={(e) => setEditingProject(prev => prev ? { ...prev, order: parseInt(e.target.value) || 0 } : null)}
                          className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="feat-proj"
                        checked={editingProject.featured || false}
                        onChange={(e) => setEditingProject(prev => prev ? { ...prev, featured: e.target.checked } : null)}
                        className="w-4 h-4 accent-purple-500 bg-purple-950 rounded"
                      />
                      <label htmlFor="feat-proj" className="text-xs text-purple-200 select-none">
                        Featured Project (displays on homepage recent work section)
                      </label>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Technologies (comma separated)</label>
                      <input
                        type="text"
                        value={editingProject.tech?.join(", ") || ""}
                        onChange={(e) => setEditingProject(prev => prev ? { ...prev, tech: e.target.value.split(",").map(t => t.trim()) } : null)}
                        placeholder="React, Tailwind, Node.js"
                        className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Main Image File Input */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider font-mono">Main Thumbnail Image</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProjectMainImageUpload}
                          disabled={projectImageUploading}
                          className="block w-full text-xs text-purple-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-purple-950/40 file:text-purple-300 hover:file:bg-purple-900/40"
                        />
                        {projectImageUploading && <span className="text-[10px] text-purple-400 animate-pulse font-mono">Uploading...</span>}
                      </div>
                      {editingProject.image_url && (
                        <div className="relative w-20 h-14 border border-purple-500/20 rounded-lg overflow-hidden mt-1 bg-purple-950/20">
                          <img src={getPublicUrl(editingProject.image_url)} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Video File Input */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider font-mono">Optional Project Video (MP4)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          onChange={handleProjectVideoUpload}
                          disabled={projectVideoUploading}
                          className="block w-full text-xs text-purple-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-purple-950/40 file:text-purple-300 hover:file:bg-purple-900/40"
                        />
                        {projectVideoUploading && <span className="text-[10px] text-purple-400 animate-pulse font-mono">Uploading...</span>}
                      </div>
                      {editingProject.video_url && (
                        <div className="mt-1 flex items-center gap-3">
                          <video
                            src={getPublicUrl(editingProject.video_url)}
                            controls
                            muted
                            className="w-32 rounded-lg border border-purple-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingProject(prev => prev ? { ...prev, video_url: "" } : null)}
                            className="px-2 py-1 bg-red-950/40 hover:bg-red-900/40 text-red-200 border border-red-500/20 text-[10px] rounded-lg transition-colors cursor-pointer"
                          >
                            Remove Video
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Screenshots inputs */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider font-mono">Screenshots Grid</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          disabled={screenshotUploading}
                          className="block w-full text-xs text-purple-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-purple-950/40 file:text-purple-300 hover:file:bg-purple-900/40"
                        />
                        {screenshotUploading && <span className="text-[10px] text-purple-400 animate-pulse font-mono">Uploading...</span>}
                      </div>
                      {editingProject.screenshots && editingProject.screenshots.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {editingProject.screenshots.map((url, idx) => (
                            <div key={idx} className="relative group border border-purple-500/10 rounded-lg overflow-hidden h-14 bg-purple-950/20">
                              <img src={getPublicUrl(url)} alt="Screenshot" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeScreenshot(idx)}
                                className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] hover:bg-red-700 transition-colors shadow cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={projectSaving || projectImageUploading || projectVideoUploading || screenshotUploading}
                        className="flex-1 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      >
                        {projectSaving ? "Saving Project..." : "Save Project Settings"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProject(null)}
                        className="px-5 py-3.5 bg-[#1c1830] border border-purple-500/20 text-purple-300 hover:text-white hover:border-purple-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Preview */}
                <div className="xl:w-1/2 bg-[#130f24]/30 border border-purple-500/10 p-6 rounded-2xl flex flex-col items-center justify-start min-h-[400px]">
                  <span className="text-[10px] uppercase font-mono text-purple-300/40 mb-6">Dynamic Public Card Preview</span>
                  
                  {/* Mock card layout mapping */}
                  <div className={`w-full bg-[#130f24] border border-purple-500/15 rounded-2xl overflow-hidden shadow-2xl ${
                    editingProject.layout === "full" ? "flex flex-col md:flex-row" : "flex flex-col"
                  }`}>
                    {/* Media container */}
                    <div className={`relative ${
                      editingProject.layout === "full" ? "md:w-1/2 h-64 md:h-auto" : "h-48"
                    } bg-purple-950/15 flex items-center justify-center overflow-hidden`}>
                      {editingProject.video_url ? (
                        <video src={getPublicUrl(editingProject.video_url)} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                      ) : editingProject.image_url ? (
                        <img src={getPublicUrl(editingProject.image_url)} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-purple-300/35 font-mono italic">No Image / Video Loaded</span>
                      )}
                    </div>
                    {/* Content container */}
                    <div className={`p-6 flex flex-col justify-between ${
                      editingProject.layout === "full" ? "md:w-1/2" : ""
                    }`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest font-mono">
                            {editingProject.category || "DEVELOPMENT"}
                          </span>
                          {editingProject.featured && (
                            <span className="bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-extrabold text-white">{editingProject.title || "Untitled Project"}</h4>
                        <p className="text-xs text-purple-200/60 leading-relaxed font-sans line-clamp-3">
                          {editingProject.description || "Project description paragraph will go here..."}
                        </p>
                      </div>

                      <div className="mt-5 space-y-4">
                        {editingProject.tech && editingProject.tech.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {editingProject.tech.map((t, idx) => (
                              <span key={idx} className="bg-purple-950/60 border border-purple-500/20 text-purple-300 text-[9px] px-2 py-0.5 rounded-lg font-mono">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          {editingProject.github_url && (
                            <a href={editingProject.github_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/20 rounded-lg text-[10px] text-purple-300 font-semibold transition-colors">
                              {editingProject.category?.toUpperCase() === "DESIGN" ? "Figma Workspace" : "GitHub Codebase"}
                            </a>
                          )}
                          {editingProject.live_url && (
                            <a href={editingProject.live_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-[10px] text-white font-semibold transition-colors">
                              Live Site URL
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* Tab 3: Skills Settings */}
        {/* ---------------------------------------------------- */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            {/* Chips List Categories */}
            <div className="bg-[#130f24] border border-purple-500/15 p-5 rounded-2xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">Skill Categories ({props.skills.length})</h3>
                <button
                  onClick={startNewSkillCategory}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  + Add Category
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {props.skills.length === 0 ? (
                  <p className="text-xs text-purple-300/40 italic">No skill categories defined.</p>
                ) : (
                  props.skills.map(cat => (
                    <div
                      key={cat.id}
                      className={`group relative flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                        editingCategory?.id === cat.id
                          ? "bg-purple-600 border-purple-400 text-white"
                          : "bg-[#1c1830]/60 border-purple-500/20 text-purple-200 hover:border-purple-500/45"
                      }`}
                    >
                      <span onClick={() => { setEditingCategory({ ...cat }); setEditingSkillItem(null); }}>{cat.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryDelete(cat.id);
                        }}
                        className="w-4 h-4 rounded-full bg-red-950/50 hover:bg-red-600 text-red-200 hover:text-white flex items-center justify-center text-[8px] transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {editingCategory && (
              <div className="flex flex-col xl:flex-row gap-6">
                {/* Form */}
                <div className="xl:w-1/2 bg-[#130f24] border border-purple-500/15 p-6 rounded-2xl space-y-6">
                  <h3 className="text-sm font-bold text-purple-200 border-b border-purple-500/10 pb-3 font-mono">
                    {editingCategory.id ? `Editing Category "${editingCategory.title}"` : "Create New Skill Category"}
                  </h3>
                  <form onSubmit={handleCategorySave} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Category Title</label>
                      <input
                        type="text"
                        required
                        value={editingCategory.title || ""}
                        onChange={(e) => setEditingCategory(prev => prev ? { ...prev, title: e.target.value } : null)}
                        placeholder="e.g. Frontend Architecture"
                        className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">SVG Icon Code</label>
                      <textarea
                        rows={2}
                        value={editingCategory.icon || ""}
                        onChange={(e) => setEditingCategory(prev => prev ? { ...prev, icon: e.target.value } : null)}
                        placeholder="<svg ...>...</svg>"
                        className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-xs text-purple-100 focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Layout Size (columns)</label>
                        <input
                          type="number"
                          min={1}
                          max={3}
                          value={editingCategory.size || 1}
                          onChange={(e) => setEditingCategory(prev => prev ? { ...prev, size: parseInt(e.target.value) || 1 } : null)}
                          className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2.5 pt-6">
                        <input
                          type="checkbox"
                          id="feat-cat"
                          checked={editingCategory.featured || false}
                          onChange={(e) => setEditingCategory(prev => prev ? { ...prev, featured: e.target.checked } : null)}
                          className="w-4 h-4 accent-purple-500"
                        />
                        <label htmlFor="feat-cat" className="text-xs text-purple-250 select-none font-mono">Featured — shows on Home page</label>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={skillSaving}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Save Category
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="px-4 py-3 bg-[#1c1830] border border-purple-500/20 text-purple-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>

                  {/* Category Items list */}
                  {editingCategory.id && (
                    <div className="border-t border-purple-500/10 pt-5 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">Category Skill Items</h4>
                        <button
                          onClick={() => startNewSkillItem(editingCategory.id!)}
                          className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-[10px] text-purple-300 font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          + Add Item
                        </button>
                      </div>

                      {editingSkillItem && editingSkillItem.category_id === editingCategory.id && (
                        <form onSubmit={handleSkillItemSave} className="flex gap-2 bg-[#1c1830] p-3 rounded-xl border border-purple-500/10">
                          <input
                            type="text"
                            required
                            value={editingSkillItem.name || ""}
                            onChange={(e) => setEditingSkillItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                            placeholder="Skill item name (e.g. Next.js)"
                            className="flex-1 bg-[#0d0918]/80 border border-purple-500/30 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={skillSaving}
                            className="px-3 py-1.5 bg-purple-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSkillItem(null)}
                            className="px-3 py-1.5 bg-purple-950 text-purple-300 text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </form>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {editingCategory.items && editingCategory.items.length > 0 ? (
                          editingCategory.items.map(item => (
                            <div key={item.id} className="flex items-center gap-1.5 bg-[#18122f] border border-purple-500/10 pl-3 pr-1 py-1 rounded-xl text-xs text-purple-200">
                              <span>{item.name}</span>
                              <button
                                onClick={() => handleSkillItemDelete(item.id)}
                                className="w-4 h-4 bg-red-950/40 hover:bg-red-600 hover:text-white rounded-full flex items-center justify-center text-[7px] text-red-200 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-purple-300/40 italic">No skill items added to this category yet.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Preview */}
                <div className="xl:w-1/2 bg-[#130f24]/30 border border-purple-500/10 p-6 rounded-2xl flex flex-col items-center justify-start min-h-[300px]">
                  <span className="text-[10px] uppercase font-mono text-purple-300/40 mb-6 font-mono">Live Group Component Preview</span>

                  <div className="w-full bg-[#1c1830] border border-purple-500/20 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        {editingCategory.icon && editingCategory.icon.trim().startsWith("<svg") ? (
                          <span dangerouslySetInnerHTML={{ __html: editingCategory.icon }} />
                        ) : (
                          <span>💡</span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-sm">{editingCategory.title || "Category Preview"}</h4>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-500/10">
                      {editingCategory.items && editingCategory.items.length > 0 ? (
                        editingCategory.items.map((it, idx) => (
                          <span key={idx} className="bg-purple-950/60 border border-purple-500/20 text-purple-300 text-xs px-2.5 py-1 rounded-xl">
                            {it.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-purple-300/30 italic">Items listing displays here...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* Tab 4: About Stats Settings */}
        {/* ---------------------------------------------------- */}
        {activeTab === "about-stats" && (
          <div className="space-y-6">
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Left Column: Stats & Tech Lists */}
              <div className="xl:w-1/2 space-y-6">
                {/* Stats Section */}
                <div className="bg-[#130f24] border border-purple-500/15 p-5 rounded-2xl">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">Statistic Counters ({props.aboutStats.length})</h3>
                    <button
                      onClick={startNewStat}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      + Add Stat
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {props.aboutStats.map(s => (
                      <div
                        key={s.id}
                        className={`group relative flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                          editingStat?.id === s.id
                            ? "bg-purple-600 border-purple-400 text-white"
                            : "bg-[#1c1830]/60 border-purple-500/20 text-purple-200 hover:border-purple-500/45"
                        }`}
                      >
                        <span onClick={() => setEditingStat({ ...s })}>{s.value} - {s.label}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatDelete(s.id);
                          }}
                          className="w-4 h-4 rounded-full bg-red-950/50 hover:bg-red-600 text-red-200 hover:text-white flex items-center justify-center text-[8px] transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack List Section */}
                <div className="bg-[#130f24] border border-purple-500/15 p-5 rounded-2xl">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">Core Tech Stack Items ({props.coreTech.length})</h3>
                    <button
                      onClick={startNewTech}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      + Add Tech
                    </button>
                  </div>
                  <div className="space-y-2">
                    {props.coreTech.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between bg-[#1c1830]/60 border border-purple-500/10 px-4 py-2 rounded-xl text-xs">
                        <span onClick={() => setEditingTech({ ...item })} className="text-purple-200 font-semibold cursor-pointer hover:underline">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTechMove(index, "up")}
                            disabled={index === 0}
                            className="px-2 py-1 bg-purple-950/30 text-purple-300 hover:bg-purple-900/30 disabled:opacity-30 rounded-lg cursor-pointer"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleTechMove(index, "down")}
                            disabled={index === props.coreTech.length - 1}
                            className="px-2 py-1 bg-purple-950/30 text-purple-300 hover:bg-purple-900/30 disabled:opacity-30 rounded-lg cursor-pointer"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => handleTechDelete(item.id)}
                            className="px-2 py-1 bg-red-950/40 text-red-200 hover:bg-red-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Forms & Previews */}
              <div className="xl:w-1/2 space-y-6">
                {/* Form Stat */}
                {editingStat && (
                  <div className="bg-[#130f24] border border-purple-500/15 p-6 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">Stat Counter Form</h3>
                    <form onSubmit={handleStatSave} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Stat Value (e.g. 5+)</label>
                          <input
                            type="text"
                            required
                            value={editingStat.value || ""}
                            onChange={(e) => setEditingStat(prev => prev ? { ...prev, value: e.target.value } : null)}
                            placeholder="5+"
                            className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Accent Color</label>
                          <input
                            type="text"
                            value={editingStat.color || "purple"}
                            onChange={(e) => setEditingStat(prev => prev ? { ...prev, color: e.target.value } : null)}
                            placeholder="purple or #a855f7"
                            className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Descriptive Label</label>
                        <input
                          type="text"
                          required
                          value={editingStat.label || ""}
                          onChange={(e) => setEditingStat(prev => prev ? { ...prev, label: e.target.value } : null)}
                          placeholder="Years of Experience"
                          className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={statSaving} className="flex-1 py-2.5 bg-purple-600 text-white text-xs font-bold rounded-xl cursor-pointer">
                          Save Stat
                        </button>
                        <button type="button" onClick={() => setEditingStat(null)} className="px-4 py-2.5 bg-[#1c1830] text-purple-300 text-xs font-bold rounded-xl cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Form Tech */}
                {editingTech && (
                  <div className="bg-[#130f24] border border-purple-500/15 p-6 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">Core Tech Item Form</h3>
                    <form onSubmit={handleTechSave} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Technology Name</label>
                        <input
                          type="text"
                          required
                          value={editingTech.name || ""}
                          onChange={(e) => setEditingTech(prev => prev ? { ...prev, name: e.target.value } : null)}
                          placeholder="e.g. Next.js / TypeScript"
                          className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={statSaving} className="flex-1 py-2.5 bg-purple-600 text-white text-xs font-bold rounded-xl cursor-pointer">
                          Save Tech Item
                        </button>
                        <button type="button" onClick={() => setEditingTech(null)} className="px-4 py-2.5 bg-[#1c1830] text-purple-300 text-xs font-bold rounded-xl cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Live Preview */}
                <div className="bg-[#130f24]/30 border border-purple-500/10 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[200px]">
                  <span className="text-[10px] uppercase font-mono text-purple-300/40 mb-4">Stat Card Live Preview</span>
                  {editingStat ? (
                    <div className="bg-[#1c1830] border border-purple-500/20 px-6 py-4 rounded-xl text-center shadow-lg w-48 space-y-1">
                      <h4 className="text-2xl font-extrabold text-purple-400">{editingStat.value || "0"}</h4>
                      <p className="text-[11px] text-purple-200/70 font-mono tracking-tight">{editingStat.label || "Placeholder"}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-purple-300/30 italic font-mono">Select or create a stat to preview</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* Tab 5: About Focus Settings */}
        {/* ---------------------------------------------------- */}
        {activeTab === "about-focus" && (
          <div className="space-y-6">
            {/* Chips List */}
            <div className="bg-[#130f24] border border-purple-500/15 p-5 rounded-2xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">Bio Paragraphs ({props.aboutFocus.length})</h3>
                <button
                  onClick={startNewFocus}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  + Add Bio Paragraph
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {props.aboutFocus.map((f, idx) => (
                  <div
                    key={f.id}
                    className={`group relative flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      editingFocus?.id === f.id
                        ? "bg-purple-600 border-purple-400 text-white"
                        : "bg-[#1c1830]/60 border-purple-500/20 text-purple-200 hover:border-purple-500/45"
                    }`}
                  >
                    <span onClick={() => setEditingFocus({ ...f })}>Paragraph #{idx + 1}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFocusDelete(f.id);
                      }}
                      className="w-4 h-4 rounded-full bg-red-950/50 hover:bg-red-600 text-red-200 hover:text-white flex items-center justify-center text-[8px] transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {editingFocus && (
              <div className="flex flex-col xl:flex-row gap-6">
                {/* Form */}
                <div className="xl:w-1/2 bg-[#130f24] border border-purple-500/15 p-6 rounded-2xl space-y-6">
                  <h3 className="text-sm font-bold text-purple-200 border-b border-purple-500/10 pb-3 font-mono">Bio Paragraph Form</h3>
                  <form onSubmit={handleFocusSave} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Paragraph Text</label>
                      <textarea
                        required
                        rows={6}
                        value={editingFocus.item || ""}
                        onChange={(e) => setEditingFocus(prev => prev ? { ...prev, item: e.target.value } : null)}
                        placeholder="Write a bio focus point here..."
                        className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={focusSaving} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
                        Save Paragraph
                      </button>
                      <button type="button" onClick={() => setEditingFocus(null)} className="px-4 py-3 bg-[#1c1830] text-purple-300 text-xs font-bold rounded-xl cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Preview */}
                <div className="xl:w-1/2 bg-[#130f24]/30 border border-purple-500/10 p-6 rounded-2xl flex flex-col items-center justify-start min-h-[250px] space-y-4">
                  <span className="text-[10px] uppercase font-mono text-purple-300/40 font-mono">Bio Paragraph Preview</span>
                  <div className="w-full bg-[#1c1830]/80 p-5 rounded-2xl border border-purple-500/10">
                    <p className="text-sm text-purple-200/80 leading-relaxed font-sans whitespace-pre-wrap">
                      {editingFocus.item || "Paragraph text contents display here..."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* Tab 6: Education Settings */}
        {/* ---------------------------------------------------- */}
        {activeTab === "education" && (
          <div className="space-y-6">
            {/* Chips List */}
            <div className="bg-[#130f24] border border-purple-500/15 p-5 rounded-2xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">Saved Educations ({props.education.length})</h3>
                <button
                  onClick={startNewEdu}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  + Add Education
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {props.education.map(edu => (
                  <div
                    key={edu.id}
                    className={`group relative flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      editingEdu?.id === edu.id
                        ? "bg-purple-600 border-purple-400 text-white"
                        : "bg-[#1c1830]/60 border-purple-500/20 text-purple-200 hover:border-purple-500/45"
                    }`}
                  >
                    <span onClick={() => setEditingEdu({ ...edu })}>{edu.degree}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEduDelete(edu.id);
                      }}
                      className="w-4 h-4 rounded-full bg-red-950/50 hover:bg-red-600 text-red-200 hover:text-white flex items-center justify-center text-[8px] transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {editingEdu && (
              <div className="flex flex-col xl:flex-row gap-6">
                {/* Form */}
                <div className="xl:w-1/2 bg-[#130f24] border border-purple-500/15 p-6 rounded-2xl space-y-6">
                  <h3 className="text-sm font-bold text-purple-200 border-b border-purple-500/10 pb-3 font-mono">Education Form</h3>
                  <form onSubmit={handleEduSave} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Degree Title</label>
                      <input
                        type="text"
                        required
                        value={editingEdu.degree || ""}
                        onChange={(e) => setEditingEdu(prev => prev ? { ...prev, degree: e.target.value } : null)}
                        placeholder="e.g. B.Sc. in Computer Science"
                        className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Institution / School</label>
                      <input
                        type="text"
                        required
                        value={editingEdu.institution || ""}
                        onChange={(e) => setEditingEdu(prev => prev ? { ...prev, institution: e.target.value } : null)}
                        placeholder="e.g. University of California"
                        className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={eduSaving} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
                        Save Education
                      </button>
                      <button type="button" onClick={() => setEditingEdu(null)} className="px-4 py-3 bg-[#1c1830] text-purple-300 text-xs font-bold rounded-xl cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Preview */}
                <div className="xl:w-1/2 bg-[#130f24]/30 border border-purple-500/10 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[250px]">
                  <span className="text-[10px] uppercase font-mono text-purple-300/40 mb-4 font-mono">Public Timeline Block Preview</span>
                  <div className="w-full max-w-sm border-l-2 border-purple-500/40 pl-4 py-2 space-y-1">
                    <h4 className="text-sm font-bold text-white">{editingEdu.degree || "Degree Title"}</h4>
                    <p className="text-xs text-purple-300/60 font-mono">{editingEdu.institution || "Institution / Platform"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* Tab 7: Certificates Settings */}
        {/* ---------------------------------------------------- */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            {/* Chips List */}
            <div className="bg-[#130f24] border border-purple-500/15 p-5 rounded-2xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">Saved Certificates ({props.certificates.length})</h3>
                <button
                  onClick={startNewCert}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  + Add Certificate
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {props.certificates.map(c => (
                  <div
                    key={c.id}
                    className={`group relative flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      editingCert?.id === c.id
                        ? "bg-purple-600 border-purple-400 text-white"
                        : "bg-[#1c1830]/60 border-purple-500/20 text-purple-200 hover:border-purple-500/45"
                    }`}
                  >
                    <span onClick={() => setEditingCert({ ...c })}>{c.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCertDelete(c.id);
                      }}
                      className="w-4 h-4 rounded-full bg-red-950/50 hover:bg-red-600 text-red-200 hover:text-white flex items-center justify-center text-[8px] transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {editingCert && (
              <div className="flex flex-col xl:flex-row gap-6">
                {/* Form */}
                <div className="xl:w-1/2 bg-[#130f24] border border-purple-500/15 p-6 rounded-2xl space-y-6">
                  <h3 className="text-sm font-bold text-purple-200 border-b border-purple-500/10 pb-3 font-mono font-mono">Certificate Form</h3>
                  <form onSubmit={handleCertSave} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Certificate Title</label>
                      <input
                        type="text"
                        required
                        value={editingCert.title || ""}
                        onChange={(e) => setEditingCert(prev => prev ? { ...prev, title: e.target.value } : null)}
                        placeholder="e.g. Google Cloud Architect"
                        className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Issued By / Platform</label>
                      <input
                        type="text"
                        required
                        value={editingCert.issued_by || ""}
                        onChange={(e) => setEditingCert(prev => prev ? { ...prev, issued_by: e.target.value } : null)}
                        placeholder="e.g. Coursera / Google"
                        className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>

                    {/* Image Upload Option */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider font-mono">Credential Image Badge</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCertImageUpload}
                          disabled={certUploading}
                          className="block w-full text-xs text-purple-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-purple-950/40 file:text-purple-300 hover:file:bg-purple-900/40"
                        />
                        {certUploading && <span className="text-[10px] text-purple-400 animate-pulse font-mono">Uploading...</span>}
                      </div>
                      {editingCert.image_url && (
                        <div className="relative w-16 h-16 border border-purple-500/20 rounded-lg overflow-hidden mt-1 bg-purple-950/20">
                          <img src={getPublicUrl(editingCert.image_url)} alt="Badge Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={certSaving || certUploading} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
                        Save Certificate
                      </button>
                      <button type="button" onClick={() => setEditingCert(null)} className="px-4 py-3 bg-[#1c1830] text-purple-300 text-xs font-bold rounded-xl cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Preview */}
                <div className="xl:w-1/2 bg-[#130f24]/30 border border-purple-500/10 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[250px]">
                  <span className="text-[10px] uppercase font-mono text-purple-300/40 mb-4 font-mono">Credential Badge Preview</span>
                  <div className="flex items-center gap-3.5 bg-[#1c1830] border border-purple-500/20 p-4 rounded-xl max-w-sm w-full">
                    {editingCert.image_url ? (
                      <img src={getPublicUrl(editingCert.image_url)} alt="Badge" className="w-12 h-12 object-cover rounded-lg border border-purple-500/20" />
                    ) : (
                      <div className="w-12 h-12 bg-purple-950 border border-purple-500/35 rounded-lg flex items-center justify-center text-purple-400">
                        🎓
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white">{editingCert.title || "Certification Title"}</h4>
                      <p className="text-xs text-purple-300/60 font-mono mt-0.5">{editingCert.issued_by || "Platform / Issuer"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* Tab 8: Core Curriculum Settings */}
        {/* ---------------------------------------------------- */}
        {activeTab === "core-curriculum" && (
          <div className="space-y-6">
            {/* Chips List */}
            <div className="bg-[#130f24] border border-purple-500/15 p-5 rounded-2xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">Curriculum Topics ({props.curriculum.length})</h3>
                <button
                  onClick={startNewCurriculum}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  + Add Topic
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {props.curriculum.map(c => (
                  <div
                    key={c.id}
                    className={`group relative flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      editingCurriculum?.id === c.id
                        ? "bg-purple-600 border-purple-400 text-white"
                        : "bg-[#1c1830]/60 border-purple-500/20 text-purple-200 hover:border-purple-500/45"
                    }`}
                  >
                    <span onClick={() => setEditingCurriculum({ ...c })}>{c.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCurriculumDelete(c.id);
                      }}
                      className="w-4 h-4 rounded-full bg-red-950/50 hover:bg-red-600 text-red-200 hover:text-white flex items-center justify-center text-[8px] transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {editingCurriculum && (
              <div className="flex flex-col xl:flex-row gap-6">
                {/* Form */}
                <div className="xl:w-1/2 bg-[#130f24] border border-purple-500/15 p-6 rounded-2xl space-y-6">
                  <h3 className="text-sm font-bold text-purple-200 border-b border-purple-500/10 pb-3 font-mono font-mono">Curriculum Form</h3>
                  <form onSubmit={handleCurriculumSave} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Topic Title</label>
                      <input
                        type="text"
                        required
                        value={editingCurriculum.title || ""}
                        onChange={(e) => setEditingCurriculum(prev => prev ? { ...prev, title: e.target.value } : null)}
                        placeholder="e.g. Distributed Databases"
                        className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">Topic Description</label>
                      <textarea
                        required
                        rows={4}
                        value={editingCurriculum.description || ""}
                        onChange={(e) => setEditingCurriculum(prev => prev ? { ...prev, description: e.target.value } : null)}
                        placeholder="Short overview of the content covered..."
                        className="w-full bg-[#0d0918]/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none leading-relaxed"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={curriculumSaving} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
                        Save Curriculum
                      </button>
                      <button type="button" onClick={() => setEditingCurriculum(null)} className="px-4 py-3 bg-[#1c1830] text-purple-300 text-xs font-bold rounded-xl cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Preview */}
                <div className="xl:w-1/2 bg-[#130f24]/30 border border-purple-500/10 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[250px]">
                  <span className="text-[10px] uppercase font-mono text-purple-300/40 mb-4 font-mono">Curriculum Grid Box Preview</span>
                  <div className="bg-[#1c1830] border border-purple-500/20 p-5 rounded-2xl max-w-sm w-full space-y-2">
                    <h4 className="text-sm font-bold text-white">{editingCurriculum.title || "Topic Title"}</h4>
                    <p className="text-xs text-purple-200/60 leading-relaxed font-sans">{editingCurriculum.description || "Description paragraph details display here..."}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}

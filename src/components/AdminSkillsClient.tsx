"use client";

import { useState } from "react";
import {
  saveSkillCategory,
  deleteSkillCategory,
  saveSkillItem,
  deleteSkillItem,
} from "@/app/admin/actions";
import { type SkillCategory, type SkillItem } from "@/lib/queries";

interface AdminSkillsClientProps {
  initialCategories: SkillCategory[];
}

export default function AdminSkillsClient({ initialCategories }: AdminSkillsClientProps) {
  const [categories, setCategories] = useState<SkillCategory[]>(initialCategories);
  
  // Category Edit State
  const [editingCategory, setEditingCategory] = useState<Partial<SkillCategory> | null>(null);
  const [categorySaving, setCategorySaving] = useState(false);

  // Skill Item Edit State
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [itemSaving, setItemSaving] = useState(false);

  // New Skill Item Input State per Category
  const [newSkillNames, setNewSkillNames] = useState<Record<string, string>>({});

  // Helper to render icon preview
  const renderIconPreview = (iconStr: string | undefined) => {
    if (iconStr && iconStr.trim().startsWith("<svg")) {
      return <span dangerouslySetInnerHTML={{ __html: iconStr }} className="text-purple-600 w-5 h-5 inline-block shrink-0" />;
    }
    return (
      <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    );
  };

  // --- Category Actions ---
  const handleCategoryCreateNew = () => {
    setEditingCategory({
      title: "",
      icon: "",
      featured: false,
      size: 0,
    });
  };

  const handleCategoryEdit = (cat: SkillCategory) => {
    setEditingCategory({
      id: cat.id,
      title: cat.title,
      icon: cat.icon,
      featured: cat.featured,
      size: cat.size,
    });
  };

  const handleCategorySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setCategorySaving(true);
    try {
      const payload = {
        id: editingCategory.id,
        title: editingCategory.title || "Untitled Category",
        icon: editingCategory.icon || "",
        featured: !!editingCategory.featured,
        size: Number(editingCategory.size || 0),
      };

      await saveSkillCategory(payload);
      alert("Skill Category saved successfully.");
      window.location.reload();
    } catch (err) {
      alert("Error saving category: " + (err as Error).message);
      setCategorySaving(false);
    }
  };

  const handleCategoryDelete = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the category "${title}"? This will delete all skills inside it.`
      )
    ) {
      return;
    }

    try {
      await deleteSkillCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
      alert("Category deleted successfully.");
      window.location.reload();
    } catch (err) {
      alert("Error deleting category: " + (err as Error).message);
    }
  };

  // --- Skill Item Actions ---
  const handleItemAdd = async (categoryId: string) => {
    const itemName = newSkillNames[categoryId]?.trim();
    if (!itemName) return;

    setItemSaving(true);
    try {
      await saveSkillItem({
        category_id: categoryId,
        name: itemName,
      });

      // Clear input
      setNewSkillNames((prev) => ({ ...prev, [categoryId]: "" }));
      
      // Auto-update size of category to match new item count
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        await saveSkillCategory({
          id: category.id,
          title: category.title,
          icon: category.icon,
          featured: category.featured,
          size: (category.items?.length || 0) + 1
        });
      }

      window.location.reload();
    } catch (err) {
      alert("Error adding skill item: " + (err as Error).message);
      setItemSaving(false);
    }
  };

  const handleItemEditStart = (item: SkillItem) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
  };

  const handleItemEditSave = async (item: SkillItem) => {
    if (!editingItemName.trim()) return;

    setItemSaving(true);
    try {
      await saveSkillItem({
        id: item.id,
        category_id: item.category_id,
        name: editingItemName.trim(),
      });
      setEditingItemId(null);
      window.location.reload();
    } catch (err) {
      alert("Error saving skill item: " + (err as Error).message);
      setItemSaving(false);
    }
  };

  const handleItemDelete = async (item: SkillItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      await deleteSkillItem(item.id);
      
      // Auto-update size of category to match new item count
      const category = categories.find(c => c.id === item.category_id);
      if (category) {
        await saveSkillCategory({
          id: category.id,
          title: category.title,
          icon: category.icon,
          featured: category.featured,
          size: Math.max(0, (category.items?.length || 0) - 1)
        });
      }

      window.location.reload();
    } catch (err) {
      alert("Error deleting skill item: " + (err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Editor / Creation Form */}
      {editingCategory ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <form onSubmit={handleCategorySave} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 pb-2 border-b border-gray-100">
              {editingCategory.id ? "Edit Skill Category" : "Create New Skill Category"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category Title</label>
                <input
                  type="text"
                  required
                  value={editingCategory.title || ""}
                  onChange={(e) =>
                    setEditingCategory((prev) => (prev ? { ...prev, title: e.target.value } : null))
                  }
                  placeholder="e.g. Frontend, Backend, Databases"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Size Number</label>
                  <input
                    type="number"
                    value={editingCategory.size || 0}
                    onChange={(e) =>
                      setEditingCategory((prev) =>
                        prev ? { ...prev, size: Number(e.target.value) } : null
                      )
                    }
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <input
                    type="checkbox"
                    id="featured-cat"
                    checked={!!editingCategory.featured}
                    onChange={(e) =>
                      setEditingCategory((prev) =>
                        prev ? { ...prev, featured: e.target.checked } : null
                      )
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="featured-cat" className="ml-2 text-sm font-bold text-gray-700 uppercase cursor-pointer">
                    Featured
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                SVG Icon Code
              </label>
              <textarea
                rows={3}
                value={editingCategory.icon || ""}
                onChange={(e) =>
                  setEditingCategory((prev) => (prev ? { ...prev, icon: e.target.value } : null))
                }
                placeholder='e.g. <svg className="w-5 h-5" ...>...</svg>'
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-950 focus:outline-none focus:border-purple-500 resize-none"
              />
              <p className="text-[10px] text-gray-450 mt-1">
                Input raw SVG HTML code. Make sure to use standard Tailwind classes (like `w-5 h-5`) for appropriate sizing.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={categorySaving}
                className="px-5 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {categorySaving ? "Saving Category..." : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Action */}
          <div className="flex justify-between items-center bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800">Categories & Skill Listings</h2>
            <button
              onClick={handleCategoryCreateNew}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              + New Category
            </button>
          </div>

          {/* Grid Layout of Categories */}
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Category Header */}
                    <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100 shrink-0">
                          {renderIconPreview(cat.icon)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-1.5">
                            {cat.title}
                            {cat.featured && (
                              <span className="text-[9px] font-mono text-purple-700 bg-purple-55 uppercase px-1.5 py-0.5 rounded font-bold border border-purple-100">
                                Featured
                              </span>
                            )}
                          </h3>
                          <span className="text-[10px] text-gray-500 font-mono">
                            Size: {cat.size || 0} items
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCategoryEdit(cat)}
                          className="text-xs text-purple-650 hover:text-purple-800 font-semibold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleCategoryDelete(cat.id, cat.title)}
                          className="text-xs text-red-650 hover:text-red-800 font-semibold hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Skill Items Listing */}
                    <div className="flex flex-wrap gap-2 py-2">
                      {cat.items && cat.items.length > 0 ? (
                        cat.items.map((item) => (
                          <div
                            key={item.id}
                            className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 text-xs px-3 py-1.5 rounded-lg border border-gray-200 font-medium"
                          >
                            {editingItemId === item.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={editingItemName}
                                  onChange={(e) => setEditingItemName(e.target.value)}
                                  className="w-24 bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs text-gray-900 focus:outline-none focus:border-purple-500 font-medium"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleItemEditSave(item)}
                                  disabled={itemSaving}
                                  className="text-[10px] text-green-600 hover:text-green-800 font-bold"
                                >
                                  ✓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingItemId(null)}
                                  className="text-[10px] text-gray-400 hover:text-gray-600 font-bold"
                                >
                                  ✗
                                </button>
                              </div>
                            ) : (
                              <>
                                <span>{item.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleItemEditStart(item)}
                                  className="text-[10px] text-purple-400 hover:text-purple-700 hover:scale-105 font-bold transition-transform"
                                >
                                  ✎
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleItemDelete(item)}
                                  className="text-[10px] text-red-400 hover:text-red-600 hover:scale-105 font-bold transition-transform"
                                >
                                  ×
                                </button>
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No skills in this category yet.</span>
                      )}
                    </div>
                  </div>

                  {/* Inline quick add skill form */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add skill (e.g. React)"
                      value={newSkillNames[cat.id] || ""}
                      onChange={(e) =>
                        setNewSkillNames((prev) => ({ ...prev, [cat.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleItemAdd(cat.id);
                        }
                      }}
                      className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleItemAdd(cat.id)}
                      disabled={itemSaving}
                      className="px-3 py-1 bg-purple-650 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0 disabled:opacity-50"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
              <p className="text-gray-500 italic text-sm">No skill categories configured. Click &quot;New Category&quot; to begin!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

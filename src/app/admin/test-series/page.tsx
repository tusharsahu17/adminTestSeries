"use client";
import { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import {
  Loader2,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import Link from "next/link";

export default function TestSeriesPage() {
  const [series, setSeries] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    price: 0,
    is_free: false,
    is_published: false,
  });

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTestSeries({ search: searchTerm });
      const data = res.data?.testSeries || res.data || res;
      setSeries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch test series:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, [searchTerm]);

  // Fetch categories once on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await adminService.getCategories();
        const data = res.data?.categories || res.data || res;
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return alert("Title is required");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        category_id: parseInt(form.category_id as string) || null,
        is_paid: !form.is_free,
      };
      await adminService.createTestSeries(payload);
      alert("Test Series created successfully!");
      setIsCreateOpen(false);
      resetForm();
      fetchSeries();
    } catch (err) {
      console.error("Create failed:", err);
      alert("Failed to create Test Series");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !selectedSeriesId) return alert("Title is required");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        category_id: parseInt(form.category_id as string) || null,
        is_paid: !form.is_free,
      };
      await adminService.updateTestSeries(selectedSeriesId, payload);
      alert("Test Series updated successfully!");
      setIsEditOpen(false);
      resetForm();
      fetchSeries();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update Test Series");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this test series?")) {
      try {
        await adminService.deleteTestSeries(id);
        alert("Test Series deleted successfully");
        fetchSeries();
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete test series");
      }
    }
  };

  const openEditModal = (item: any) => {
    setSelectedSeriesId(item.id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      category_id: item.category_id || item.category || "",
      price: item.price || 0,
      is_free: !!item.is_free,
      is_published: !!item.is_published,
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category_id: "",
      price: 0,
      is_free: false,
      is_published: false,
    });
    setSelectedSeriesId(null);
  };

  return (
    <div className="flex flex-col h-full space-y-6 relative">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Test Series Management
          </h1>
          <p className="text-sm text-gray-500">
            Create, edit, and organize exam series.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Test Series
        </button>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search test series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Series Name
                </th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                  </td>
                </tr>
              ) : series.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No test series found.
                  </td>
                </tr>
              ) : (
                series.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-5 text-sm text-gray-500">#{item.id}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {item.title?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.tests_count || 0} Tests
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {categories.find(c => c.id === Number(item.category_id))?.name || 'N/A'} (#{item?.category_id || 'N/A'})
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-sm font-medium text-gray-900">
                      {item.is_free ? "Free" : `₹${item.price || 0}`}
                    </td>
                    <td className="py-3 px-5">
                      {item.is_published ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <XCircle className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal for Create/Edit Test Series */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {isEditOpen ? "Edit Test Series" : "Create New Test Series"}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={isEditOpen ? handleEdit : handleCreate}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none h-20"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={form.is_free}
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_free}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        is_free: e.target.checked,
                        price: e.target.checked ? 0 : form.price,
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  Is Free?
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) =>
                      setForm({ ...form, is_published: e.target.checked })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  Publish Immediately
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setIsEditOpen(false);
                  }}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}{" "}
                  {isEditOpen ? "Save Changes" : "Create Series"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

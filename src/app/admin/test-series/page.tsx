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
  Menu
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
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
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

  const [testsInSeries, setTestsInSeries] = useState<any[]>([]);
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [testSearchTerm, setTestSearchTerm] = useState("");
  const [selectedTestsToAdd, setSelectedTestsToAdd] = useState<Set<string>>(new Set());
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [loadingTests, setLoadingTests] = useState(false);

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

  const searchTests = async () => {
    setLoadingTests(true);
    try {
      const res = await adminService.getTests({ search: testSearchTerm });
      const data = res.data?.tests || res.data || res;
      setAvailableTests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tests:", err);
    } finally {
      setLoadingTests(false);
    }
  };

  useEffect(() => {
    if (isAddTestOpen) {
      searchTests();
    }
  }, [testSearchTerm, isAddTestOpen]);

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
      const res = await adminService.createTestSeries(payload) as any;
      const newSeriesId = res.seriesId || res.data?.seriesId;

      if (newSeriesId && testsInSeries.length > 0) {
        const testIds = testsInSeries.map(t => t.id || t.test_id);
        await adminService.syncSeriesTests(newSeriesId, testIds);
      }

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

      const orderedIds = testsInSeries.map(t => t.id || t.test_id);
      await adminService.syncSeriesTests(selectedSeriesId, orderedIds);

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

  const openEditModal = async (item: any) => {
    setSelectedSeriesId(item.id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      category_id: item.category_id || item.category || "",
      price: item.price || 0,
      is_free: !!item.is_free,
      is_published: !!item.is_published,
    });
    setTestsInSeries([]);
    setIsEditOpen(true);
    
    try {
      const res = await adminService.getSeriesDetails(item.id) as any;
      if (res && res.tests) {
        setTestsInSeries(res.tests.map((t: any) => ({...t, existing: true})));
      }
    } catch (err) {
      console.error("Failed to fetch series details:", err);
    }
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
    setTestsInSeries([]);
  };

  const handleDragStart = (index: number) => setDraggedItemIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newTests = [...testsInSeries];
    const dragged = newTests[draggedItemIndex];
    newTests.splice(draggedItemIndex, 1);
    newTests.splice(index, 0, dragged);
    setDraggedItemIndex(index);
    setTestsInSeries(newTests);
  };
  const handleDragEnd = () => setDraggedItemIndex(null);

  const toggleTestSelection = (testId: string) => {
    const newSelection = new Set(selectedTestsToAdd);
    if (newSelection.has(testId)) {
      newSelection.delete(testId);
    } else {
      newSelection.add(testId);
    }
    setSelectedTestsToAdd(newSelection);
  };

  const addSelectedTests = () => {
    const testsToAdd = availableTests.filter(t => selectedTestsToAdd.has(t.id?.toString()));
    const existingIds = new Set(testsInSeries.map(t => t.id?.toString()));
    const uniqueTestsToAdd = testsToAdd.filter(t => !existingIds.has(t.id?.toString()));
    
    setTestsInSeries([...testsInSeries, ...uniqueTestsToAdd]);
    setIsAddTestOpen(false);
    setSelectedTestsToAdd(new Set());
    setTestSearchTerm("");
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
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" /> Published
                          </span>
                          {(item.published_at || item.publishedAt) && (
                            <p className="text-[11px] text-gray-500 mt-1">
                              {new Date(item.published_at || item.publishedAt).toLocaleDateString('en-IN')}
                            </p>
                          )}
                        </div>
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
      {(isCreateOpen || isEditOpen) && !isAddTestOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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

              {/* Tests in Series Section */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tests in Series
                  </label>
                </div>
                {testsInSeries.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100 mb-3 bg-gray-50">
                    {testsInSeries.map((test, index) => (
                      <div
                        key={test.id || index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-3 bg-white ${draggedItemIndex === index ? 'opacity-50 bg-gray-100' : ''} cursor-move`}
                      >
                        <Menu className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500 w-5">{index + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{test.title || test.name}</p>
                          <p className="text-xs text-gray-500">
                            {test.subject_name || test.category_name || "Uncategorized"} • {test.total_questions || test.questions_count || 0} Questions • {test.duration || 60} mins
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newTests = [...testsInSeries];
                            newTests.splice(index, 1);
                            setTestsInSeries(newTests);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-gray-200 border-dashed rounded-lg p-6 text-center text-sm text-gray-500 mb-3">
                    No tests added to this series yet.
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => setIsAddTestOpen(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Test
                </button>
              </div>

              <div className="flex gap-6 pt-4">
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

      {/* Modal for Adding Tests to Series */}
      {isAddTestOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Add Tests to Series
              </h3>
              <button
                onClick={() => setIsAddTestOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by test name..."
                value={testSearchTerm}
                onChange={(e) => setTestSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex-1 overflow-y-auto mb-4 border border-gray-100 rounded-lg">
              {loadingTests ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : availableTests.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  No tests found.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {availableTests.map((test) => {
                    // check if already added
                    const isAlreadyAdded = testsInSeries.some(t => t.id === test.id);
                    return (
                      <label key={test.id} className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 ${isAlreadyAdded ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                          type="checkbox"
                          disabled={isAlreadyAdded}
                          checked={selectedTestsToAdd.has(test.id?.toString()) || isAlreadyAdded}
                          onChange={() => toggleTestSelection(test.id?.toString())}
                          className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{test.title || test.name}</p>
                          <p className="text-xs text-gray-500">
                            {test.subject_name || test.category_name || "Uncategorized"} • {test.total_questions || test.questions_count || 0} Questions • {test.duration || 60} mins
                          </p>
                          {isAlreadyAdded && <span className="text-[10px] text-indigo-600 font-medium">Already in series</span>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddTestOpen(false)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addSelectedTests}
                disabled={selectedTestsToAdd.size === 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Add Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { adminService } from '../../../services/adminService';
import {
  Loader2,
  Search,
  Plus,
  Edit,
  Trash2,
  Folder,
  BookOpen,
  Network,
  Clock,
  Layers,
  ChevronRight,
  ChevronDown,
  X,
  FileText,
  Tag,
  CheckCircle2,
} from 'lucide-react';

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isManageSubjectsOpen, setIsManageSubjectsOpen] = useState(false);
  const [isHierarchyOpen, setIsHierarchyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeExam, setActiveExam] = useState<any>(null);

  // Subject Mapping state
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [examSubjects, setExamSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [displayOrders, setDisplayOrders] = useState<Record<string, number>>({});

  // Hierarchy state
  const [hierarchyData, setHierarchyData] = useState<any>(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [hierarchySearch, setHierarchySearch] = useState('');
  const [collapsedSubjectIds, setCollapsedSubjectIds] = useState<Set<string>>(new Set());

  // Form state (matches Step 1 Payload)
  const [form, setForm] = useState<{
    name: string;
    category: string;
    exam_type: string;
    duration_minutes: number | '';
    total_questions: number | '';
    total_marks: number | '';
    passing_marks: number | '';
    difficulty: string;
    description: string;
  }>({
    name: '',
    category: '',
    exam_type: 'Competitive',
    duration_minutes: 60,
    total_questions: 100,
    total_marks: 200,
    passing_marks: 80,
    difficulty: 'Medium',
    description: '',
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await adminService.getExams();
      const data = res.exams || res.data?.exams || res.data || res;
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return alert('Name is required');
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        category: form.category || 'General',
        exam_type: form.exam_type || 'Competitive',
        duration_minutes: form.duration_minutes === '' ? 60 : Number(form.duration_minutes),
        total_questions: form.total_questions === '' ? 100 : Number(form.total_questions),
        total_marks: form.total_marks === '' ? 200 : Number(form.total_marks),
        passing_marks: form.passing_marks === '' ? 80 : Number(form.passing_marks),
        difficulty: form.difficulty || 'Medium',
        description: form.description,
      };
      await adminService.createExam(payload);
      alert('Exam created successfully!');
      setIsCreateOpen(false);
      resetForm();
      fetchExams();
    } catch (err) {
      console.error('Create failed:', err);
      alert('Failed to create Exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !selectedId) return alert('Name is required');
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        category: form.category || 'General',
        exam_type: form.exam_type || 'Competitive',
        duration_minutes: form.duration_minutes === '' ? 60 : Number(form.duration_minutes),
        total_questions: form.total_questions === '' ? 100 : Number(form.total_questions),
        total_marks: form.total_marks === '' ? 200 : Number(form.total_marks),
        passing_marks: form.passing_marks === '' ? 80 : Number(form.passing_marks),
        difficulty: form.difficulty || 'Medium',
        description: form.description,
      };
      await adminService.updateExam(selectedId, payload);
      alert('Exam updated successfully!');
      setIsEditOpen(false);
      resetForm();
      fetchExams();
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update Exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      try {
        await adminService.deleteExam(id);
        alert('Exam deleted successfully');
        fetchExams();
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete exam');
      }
    }
  };

  const openEditModal = (item: any) => {
    setSelectedId(String(item.id));
    setForm({
      name: item.name || '',
      category: item.category || '',
      exam_type: item.exam_type || 'Competitive',
      duration_minutes: item.duration_minutes ?? item.duration ?? 60,
      total_questions: item.total_questions ?? 100,
      total_marks: item.total_marks ?? 200,
      passing_marks: item.passing_marks ?? 80,
      difficulty: item.difficulty || 'Medium',
      description: item.description || '',
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setForm({
      name: '',
      category: '',
      exam_type: 'Competitive',
      duration_minutes: 60,
      total_questions: 100,
      total_marks: 200,
      passing_marks: 80,
      difficulty: 'Medium',
      description: '',
    });
    setSelectedId(null);
  };

  // Manage Subjects
  const openManageSubjectsModal = async (exam: any) => {
    setActiveExam(exam);
    setIsManageSubjectsOpen(true);
    setLoadingSubjects(true);
    try {
      const [allSubsRes, examSubsRes] = await Promise.all([
        adminService.getSubjects(),
        adminService.getExamSubjects(exam.id),
      ]);
      const allData = allSubsRes?.subjects || allSubsRes?.data?.subjects || allSubsRes?.data || allSubsRes;
      setAllSubjects(Array.isArray(allData) ? allData : []);

      const examData = examSubsRes?.subjects || examSubsRes?.data?.subjects || examSubsRes?.data || examSubsRes;
      const loadedExamSubs = Array.isArray(examData) ? examData : [];
      setExamSubjects(loadedExamSubs);

      // Seed display orders
      const orders: Record<string, number> = {};
      loadedExamSubs.forEach((s: any, idx: number) => {
        orders[String(s.id)] = s.displayOrder ?? s.display_order ?? idx + 1;
      });
      setDisplayOrders(orders);
    } catch (err) {
      console.error('Failed to load subjects:', err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleToggleSubject = async (subjectId: string | number, isLinked: boolean) => {
    if (!activeExam) return;
    try {
      const subIdStr = String(subjectId);
      if (isLinked) {
        await adminService.removeExamSubject(activeExam.id, subIdStr);
        setExamSubjects((prev) => prev.filter((s) => String(s.id) !== subIdStr));
      } else {
        const order = displayOrders[subIdStr] || examSubjects.length + 1;
        await adminService.addExamSubject(activeExam.id, subIdStr, order);
        const addedSub = allSubjects.find((s) => String(s.id) === subIdStr);
        if (addedSub) {
          setExamSubjects((prev) => [...prev, { ...addedSub, displayOrder: order }]);
        }
      }
    } catch (err: any) {
      console.error('Toggle subject failed:', err);
      alert(err.response?.data?.error || 'Failed to update subject linkage');
    }
  };

  // View Hierarchy
  const openHierarchyModal = async (exam: any) => {
    setActiveExam(exam);
    setHierarchySearch('');
    setCollapsedSubjectIds(new Set());
    setIsHierarchyOpen(true);
    setLoadingHierarchy(true);
    try {
      const res = await adminService.getExamHierarchy(exam.id);
      const data = res?.hierarchy || res?.data?.hierarchy || res?.data || res;
      setHierarchyData(data);
    } catch (err) {
      console.error('Failed to load hierarchy:', err);
    } finally {
      setLoadingHierarchy(false);
    }
  };

  const toggleHierarchySubject = (subjectId: string | number) => {
    const idStr = String(subjectId);
    setCollapsedSubjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(idStr)) next.delete(idStr);
      else next.add(idStr);
      return next;
    });
  };

  const filteredExams = exams.filter((e) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (e.name || '').toLowerCase().includes(term) ||
      (e.category || '').toLowerCase().includes(term) ||
      (e.exam_type || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col h-full space-y-6 relative">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-sm text-gray-500">
            Create exams, map subjects with display order, and inspect complete exam hierarchies.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Exam
        </button>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams by name, category or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">{filteredExams.length} Exam(s)</span>
        </div>

        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam Name</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category & Type</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Config</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulty</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-xs">
                    No exams found.
                  </td>
                </tr>
              ) : (
                filteredExams.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-5 text-xs font-mono text-gray-500">#{cat.id}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                          <Folder className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 text-sm">{cat.name}</span>
                          {cat.description && (
                            <p className="text-2xs text-gray-500 line-clamp-1 mt-0.5">{cat.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-800">
                          {cat.category || 'Staff Selection Commission'}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-2xs font-semibold bg-gray-100 text-gray-700 w-max">
                          {cat.exam_type || 'Competitive'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-xs text-gray-600">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{cat.duration_minutes ?? cat.duration ?? 60} mins</span>
                          <span>&bull;</span>
                          <span>{cat.total_questions ?? 100} Qs</span>
                        </div>
                        <div className="text-2xs text-gray-500">
                          Marks: {cat.total_marks ?? 200} | Pass: {cat.passing_marks ?? 80}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold uppercase ${
                          cat.difficulty === 'Hard' || cat.difficulty === 'hard'
                            ? 'bg-rose-100 text-rose-700'
                            : cat.difficulty === 'Easy' || cat.difficulty === 'easy'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {cat.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openHierarchyModal(cat)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Exam Hierarchy"
                        >
                          <Network className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openManageSubjectsModal(cat)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Map Subjects & Display Order"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Exam"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Exam"
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

      {/* Modal for Create/Edit Exam */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{isEditOpen ? 'Edit Exam' : 'Create Exam'}</h3>
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
            <form onSubmit={isEditOpen ? handleEdit : handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Exam Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SSC CGL"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Staff Selection Commission"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Exam Type</label>
                  <select
                    value={form.exam_type}
                    onChange={(e) => setForm({ ...form, exam_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Competitive">Competitive</option>
                    <option value="Entrance">Entrance</option>
                    <option value="Academic">Academic</option>
                    <option value="Practice">Practice</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Duration (m)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.duration_minutes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        duration_minutes: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Questions</label>
                  <input
                    type="number"
                    min="1"
                    value={form.total_questions}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        total_questions: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={form.total_marks}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        total_marks: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Pass Marks</label>
                  <input
                    type="number"
                    min="0"
                    value={form.passing_marks}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        passing_marks: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setIsEditOpen(false);
                  }}
                  className="px-4 py-2 text-gray-700 text-xs font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}{' '}
                  {isEditOpen ? 'Save Changes' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Manage Subjects with Display Order */}
      {isManageSubjectsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 shrink-0 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Map Subjects for {activeExam?.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Link subjects and configure display order for student view.
                </p>
              </div>
              <button
                onClick={() => setIsManageSubjectsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {loadingSubjects ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Loading mapped subjects...</p>
                </div>
              ) : allSubjects.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No subjects found in the system.</p>
              ) : (
                allSubjects.map((sub) => {
                  const linkedItem = examSubjects.find((es) => String(es.id) === String(sub.id));
                  const isLinked = !!linkedItem;
                  const currentOrder =
                    displayOrders[String(sub.id)] ?? linkedItem?.displayOrder ?? linkedItem?.display_order ?? 1;

                  return (
                    <div
                      key={sub.id}
                      className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                        isLinked
                          ? 'border-indigo-200 bg-indigo-50/30'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex-1 mr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{sub.name}</span>
                          <span className="text-2xs font-mono text-gray-400">#{sub.id}</span>
                          {linkedItem?.topic_count !== undefined && (
                            <span className="text-2xs bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-semibold">
                              {linkedItem.topic_count} topics
                            </span>
                          )}
                          {linkedItem?.test_count !== undefined && (
                            <span className="text-2xs bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-semibold">
                              {linkedItem.test_count} tests
                            </span>
                          )}
                        </div>
                        {sub.description && (
                          <p className="text-2xs text-gray-500 line-clamp-1 mt-0.5">{sub.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isLinked && (
                          <div className="flex items-center gap-1">
                            <span className="text-2xs text-gray-500 font-medium">Order:</span>
                            <input
                              type="number"
                              min="1"
                              value={currentOrder}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setDisplayOrders((prev) => ({ ...prev, [String(sub.id)]: val }));
                              }}
                              className="w-12 px-1.5 py-1 text-xs border border-gray-300 rounded text-center bg-white"
                              title="Display order in exam"
                            />
                          </div>
                        )}
                        <button
                          onClick={() => handleToggleSubject(sub.id, isLinked)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                            isLinked
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                          }`}
                        >
                          {isLinked ? 'Remove' : <><Plus className="w-3.5 h-3.5" /> Map</>}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 mt-3 flex justify-end shrink-0 border-t border-gray-100">
              <button
                onClick={() => setIsManageSubjectsOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Full Hierarchy Viewer (GET /api/exams/:examId/hierarchy) */}
      {isHierarchyOpen && (() => {
        const allHierarchySubjects: any[] = hierarchyData?.subjects || [];
        const totalSubjectsCount = allHierarchySubjects.length;
        const totalTopicsCount = allHierarchySubjects.reduce(
          (acc, s) => acc + (s.topics?.length || 0),
          0
        );
        const totalSubtopicsCount = allHierarchySubjects.reduce(
          (acc, s) =>
            acc +
            (s.topics || []).reduce((tAcc: number, t: any) => tAcc + (t.subtopics?.length || 0), 0),
          0
        );

        const q = hierarchySearch.trim().toLowerCase();
        const filteredHierarchySubjects = !q
          ? allHierarchySubjects
          : allHierarchySubjects
              .map((subj) => {
                const subjMatch = (subj.name || '').toLowerCase().includes(q);
                const matchingTopics = (subj.topics || [])
                  .map((top: any) => {
                    const topMatch = (top.name || '').toLowerCase().includes(q);
                    const matchingSubtopics = (top.subtopics || []).filter((st: any) =>
                      (st.name || '').toLowerCase().includes(q)
                    );
                    if (topMatch || subjMatch) return top;
                    if (matchingSubtopics.length > 0) {
                      return { ...top, subtopics: matchingSubtopics };
                    }
                    return null;
                  })
                  .filter(Boolean);

                if (subjMatch || matchingTopics.length > 0) {
                  return {
                    ...subj,
                    topics: subjMatch && matchingTopics.length === 0 ? subj.topics || [] : matchingTopics,
                  };
                }
                return null;
              })
              .filter(Boolean);

        return (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
            onClick={() => setIsHierarchyOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl border border-gray-200/80 max-w-3xl w-full animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[88vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50/90 via-sky-50/40 to-white border-b border-gray-200/80 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200">
                    <Network className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-900">Exam Hierarchy</h3>
                      {activeExam?.name && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200/70">
                          {activeExam.name}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Interactive curriculum map across subjects, topics, and subtopics
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!loadingHierarchy && totalSubjectsCount > 0 && (
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-medium">
                      <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                        {totalSubjectsCount} Subjects
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/70">
                        {totalTopicsCount} Topics
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        {totalSubtopicsCount} Subtopics
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => setIsHierarchyOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Toolbar: Search + Expand/Collapse + Legend */}
              {!loadingHierarchy && totalSubjectsCount > 0 && (
                <div className="px-5 py-2.5 bg-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                  <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Filter subjects, topics, subtopics..."
                      value={hierarchySearch}
                      onChange={(e) => setHierarchySearch(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-colors"
                    />
                    {hierarchySearch && (
                      <button
                        type="button"
                        onClick={() => setHierarchySearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-3 text-[10px] font-medium text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        Subject
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                        Topic
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Subtopic
                      </span>
                    </div>

                    <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
                      <button
                        type="button"
                        onClick={() => setCollapsedSubjectIds(new Set())}
                        className="px-2 py-1 text-[10px] font-medium text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        Expand All
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCollapsedSubjectIds(
                            new Set(allHierarchySubjects.map((s) => String(s.id)))
                          )
                        }
                        className="px-2 py-1 text-[10px] font-medium text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="p-5 overflow-y-auto flex-1 bg-slate-50/70 space-y-3">
                {loadingHierarchy ? (
                  <div className="py-16 text-center">
                    <Loader2 className="w-7 h-7 animate-spin text-indigo-600 mx-auto mb-2.5" />
                    <p className="text-xs text-gray-500 font-medium">Loading exam hierarchy...</p>
                  </div>
                ) : totalSubjectsCount === 0 ? (
                  <div className="bg-white border border-dashed border-gray-200 rounded-xl py-12 px-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-2.5">
                      <Layers className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700">No Hierarchy Available</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      No subjects or topics have been mapped to this exam yet.
                    </p>
                  </div>
                ) : filteredHierarchySubjects.length === 0 ? (
                  <div className="bg-white border border-dashed border-gray-200 rounded-xl py-10 px-6 text-center">
                    <p className="text-xs font-semibold text-gray-700">No Matches Found</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Nothing in this exam matches &ldquo;{hierarchySearch}&rdquo;.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredHierarchySubjects.map((subj: any) => {
                      const topicCount = subj.topics?.length || 0;
                      const isCollapsed = !q && collapsedSubjectIds.has(String(subj.id));

                      return (
                        <div
                          key={subj.id}
                          className="bg-white border border-indigo-200/80 border-l-4 border-l-indigo-500 rounded-xl overflow-hidden shadow-xs transition-all"
                        >
                          {/* Collapsible Subject Header */}
                          <button
                            type="button"
                            onClick={() => toggleHierarchySubject(subj.id)}
                            className="w-full px-4 py-2.5 bg-indigo-50/60 hover:bg-indigo-50/90 border-b border-indigo-100/80 flex items-center justify-between transition-colors text-left"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {isCollapsed ? (
                                <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-indigo-600 shrink-0" />
                              )}
                              <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                <Folder className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-semibold text-indigo-950 truncate">
                                {subj.name}
                              </span>
                              <span className="text-[10px] font-mono text-indigo-400 shrink-0">
                                #{subj.id}
                              </span>
                            </div>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-100/80 text-indigo-700 border border-indigo-200/70 shrink-0">
                              {topicCount} {topicCount === 1 ? 'topic' : 'topics'}
                            </span>
                          </button>

                          {/* Topics Tree */}
                          {!isCollapsed && (
                            <div className="p-3.5 bg-white">
                              {topicCount === 0 ? (
                                <p className="text-[11px] text-gray-400 italic px-2 py-1">
                                  No topics under this subject
                                </p>
                              ) : (
                                <div className="border-l-2 border-indigo-200/70 ml-2.5 pl-3.5 space-y-2.5">
                                  {subj.topics.map((top: any) => {
                                    const subtopicCount = top.subtopics?.length || 0;
                                    return (
                                      <div
                                        key={top.id}
                                        className="relative p-2.5 bg-sky-50/45 rounded-lg border border-sky-200/80 border-l-4 border-l-sky-500"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-5 h-5 rounded bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                                              <FileText className="w-3 h-3" />
                                            </div>
                                            <span className="text-xs font-medium text-sky-950 truncate">
                                              {top.name}
                                            </span>
                                            <span className="text-[10px] font-mono text-sky-500/80 shrink-0">
                                              #{top.id}
                                            </span>
                                          </div>
                                          <span className="text-[10px] font-medium text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full border border-sky-200/80 shrink-0">
                                            {subtopicCount}{' '}
                                            {subtopicCount === 1 ? 'subtopic' : 'subtopics'}
                                          </span>
                                        </div>

                                        {/* Subtopics Branch */}
                                        {subtopicCount > 0 && (
                                          <div className="mt-2 ml-2.5 pl-3 border-l-2 border-sky-200/70 pt-1.5 flex flex-wrap gap-1.5">
                                            {top.subtopics.map((subtop: any) => (
                                              <span
                                                key={subtop.id}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 shadow-2xs"
                                              >
                                                <Tag className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                                <span>{subtop.name}</span>
                                                <span className="text-emerald-500/80 text-[9px] font-mono">
                                                  #{subtop.id}
                                                </span>
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-gray-500">
                  {totalSubjectsCount > 0
                    ? `Showing ${filteredHierarchySubjects.length} of ${totalSubjectsCount} subject(s)`
                    : 'Exam hierarchy'}
                </span>
                <button
                  onClick={() => setIsHierarchyOpen(false)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

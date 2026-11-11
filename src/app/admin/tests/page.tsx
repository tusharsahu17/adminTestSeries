'use client';
import { useEffect, useState } from 'react';
import { adminService } from '../../../services/adminService';
import { Loader2, Search, Plus, Edit, Copy, Trash2, Clock, CheckCircle, FileText, Eye, X } from 'lucide-react';
import Link from 'next/link';

export default function TestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    duration: 60,
    total_marks: 100,
    passing_marks: 33,
    subject_id: '',
    is_published: false,
    questions_count: 0
  });

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTests({ search: searchTerm });
      const data = res.data?.tests || res.data || res;
      setTests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await adminService.getSubjects();
      // res might be { subjects: [...] } from the API or { data: [...] } from mock
      const data = res?.subjects || res?.data?.subjects || res?.data || res;
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchSubjects();
  }, [searchTerm]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.subject_id) return alert('Title and Subject are required');
    setSubmitting(true);
    try {
      const payload = { 
        ...form, 
        name: form.title,
        subject_id: parseInt(form.subject_id, 10),
        total_questions: form.questions_count,
        duration_minutes: form.duration
      };
      await adminService.createTest(payload);
      alert('Test created successfully!');
      setIsCreateOpen(false);
      resetForm();
      fetchTests();
    } catch (err) {
      console.error('Create failed:', err);
      alert('Failed to create Test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !selectedTestId || !form.subject_id) return alert('Title and Subject are required');
    setSubmitting(true);
    try {
      const payload = { 
        ...form, 
        name: form.title,
        subject_id: parseInt(form.subject_id, 10),
        total_questions: form.questions_count,
        duration_minutes: form.duration
      };
      await adminService.updateTest(selectedTestId, payload);
      alert('Test updated successfully!');
      setIsEditOpen(false);
      resetForm();
      fetchTests();
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update Test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this test?')) {
      try {
        await adminService.deleteTest(id);
        alert('Test deleted successfully');
        fetchTests();
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete test');
      }
    }
  };

  const openEditModal = (item: any) => {
    setSelectedTestId(item.id);
    setForm({
      title: item.title || item.name || '',
      duration: item.duration_minutes || item.duration || 60,
      total_marks: item.total_marks || 100,
      passing_marks: item.passing_marks || 33,
      subject_id: item.subject_id || '',
      is_published: !!item.is_published,
      questions_count: item.total_questions || item.questions_count || 0
    });
    setIsEditOpen(true);
  };

  const openViewModal = (item: any) => {
    setViewData(item);
    setIsViewOpen(true);
  };

  const resetForm = () => {
    setForm({
      title: '',
      duration: 60,
      total_marks: 100,
      passing_marks: 33,
      subject_id: '',
      is_published: false,
      questions_count: 0
    });
    setSelectedTestId(null);
  };

  return (
    <div className="flex flex-col h-full space-y-6 relative">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam/Test Management</h1>
          <p className="text-sm text-gray-500">Create tests, set rules, and duplicate exams.</p>
        </div>
        <button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Create New Test
        </button>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by test name..."
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
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Test Name</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Config</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Questions</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
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
              ) : tests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">No tests found.</td>
                </tr>
              ) : (
                tests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-5 text-sm text-gray-500">#{test.id}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{test.title || test.name}</p>
                          <p className="text-xs text-gray-500">Passing: {test.passing_marks || 0}/{test.total_marks || 0} &bull; {test.total_questions || test.questions_count || 0} Questions</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" /> {test.duration_minutes || test.duration || 60} mins
                      </div>
                    </td>
                    <td className="py-3 px-5 text-sm font-medium text-gray-900">
                      {test.total_questions || test.questions_count || 0}
                    </td>
                    <td className="py-3 px-5">
                      {String(test.status || '').toLowerCase() === 'scheduled' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          Scheduled
                        </span>
                      ) : test.is_published || String(test.status || '').toLowerCase() === 'published' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => openViewModal(test)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEditModal(test)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(test.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
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

      {/* Modal for Create/Edit Test */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">{isEditOpen ? 'Edit Test' : 'Create New Test'}</h3>
              <button onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <Loader2 className="w-5 h-5 hidden" />
                <span className="text-lg font-bold">&times;</span>
              </button>
            </div>
            <form onSubmit={isEditOpen ? handleEdit : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={form.subject_id} 
                  onChange={e => setForm({...form, subject_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="" disabled>Select a subject</option>
                  {subjects.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (m)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={form.duration} 
                    onChange={e => setForm({...form, duration: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. of Questions</label>
                  <input 
                    type="number" 
                    min="0"
                    value={form.questions_count} 
                    onChange={e => setForm({...form, questions_count: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                  <input 
                    type="number" 
                    min="1"
                    value={form.total_marks} 
                    onChange={e => setForm({...form, total_marks: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pass Marks</label>
                  <input 
                    type="number" 
                    min="0"
                    value={form.passing_marks} 
                    onChange={e => setForm({...form, passing_marks: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.is_published} 
                    onChange={e => setForm({...form, is_published: e.target.checked})}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  Publish Immediately
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} {isEditOpen ? 'Save Changes' : 'Create Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Modal */}
      {isViewOpen && viewData && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">Test Preview</h3>
              <button onClick={() => setIsViewOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50 rounded-lg flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{viewData.title || viewData.name}</h4>
                  <p className="text-sm text-gray-500">ID: #{viewData.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Duration</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" /> {viewData.duration_minutes || viewData.duration || 60} mins
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                  <p className="text-sm font-medium text-gray-900">
                    {viewData.is_published ? (
                      <span className="text-green-600 font-semibold">Published</span>
                    ) : (
                      <span className="text-gray-600 font-semibold">Draft</span>
                    )}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Passing Marks</p>
                  <p className="text-sm font-medium text-gray-900">{viewData.passing_marks || 0} / {viewData.total_marks || 0}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Questions</p>
                  <p className="text-sm font-medium text-gray-900">{viewData.total_questions || viewData.questions_count || 0}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end mt-6 border-t border-gray-100">
              <button type="button" onClick={() => setIsViewOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

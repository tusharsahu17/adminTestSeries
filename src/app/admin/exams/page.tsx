'use client';
import { useEffect, useState } from 'react';
import { adminService } from '../../../services/adminService';
import { Loader2, Search, Plus, Edit, Trash2, Folder, BookOpen, Check } from 'lucide-react';

export default function ExamsPage() {
  const [exams, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isManageSubjectsOpen, setIsManageSubjectsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeExam, setActiveExam] = useState<any>(null);
  
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [examSubjects, setExamSubjects] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '',
    description: ''
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await adminService.getExams();
      const data = res.data?.exams || res.data || res;
      setCategories(Array.isArray(data) ? data : []);
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
      await adminService.createExam(form);
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
      await adminService.updateExam(selectedId, form);
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
    setSelectedId(item.id);
    setForm({
      name: item.name || '',
      description: item.description || ''
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setForm({ name: '', description: '' });
    setSelectedId(null);
  };

  const openManageSubjectsModal = async (exam: any) => {
    setActiveExam(exam);
    setIsManageSubjectsOpen(true);
    try {
      const [allSubsRes, examSubsRes] = await Promise.all([
        adminService.getSubjects(),
        adminService.getExamSubjects(exam.id)
      ]);
      const allData = allSubsRes?.subjects || allSubsRes?.data?.subjects || allSubsRes?.data || allSubsRes;
      setAllSubjects(Array.isArray(allData) ? allData : []);
      
      const examData = examSubsRes?.subjects || examSubsRes?.data?.subjects || examSubsRes?.data || examSubsRes;
      setExamSubjects(Array.isArray(examData) ? examData : []);
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  const handleToggleSubject = async (subjectId: string, isLinked: boolean) => {
    if (!activeExam) return;
    try {
      if (isLinked) {
        await adminService.removeExamSubject(activeExam.id, subjectId);
        setExamSubjects(prev => prev.filter(s => s.id !== subjectId));
      } else {
        await adminService.addExamSubject(activeExam.id, subjectId);
        const addedSub = allSubjects.find(s => s.id === subjectId);
        if (addedSub) setExamSubjects(prev => [...prev, addedSub]);
      }
    } catch (err: any) {
      console.error('Toggle subject failed:', err);
      alert(err.response?.data?.error || 'Failed to update subject linkage');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 relative">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-sm text-gray-500">Manage exams used for organizing test series.</p>
        </div>
        <button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Exam
        </button>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden">
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                  </td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">No exams found.</td>
                </tr>
              ) : (
                exams.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-5 text-sm text-gray-500">#{cat.id}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Folder className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-sm text-gray-600">{cat.description || '-'}</td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openManageSubjectsModal(cat)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Manage Subjects">
                          <BookOpen className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEditModal(cat)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
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
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">{isEditOpen ? 'Edit Exam' : 'Add Exam'}</h3>
              <button onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <Loader2 className="w-5 h-5 hidden" />
                <span className="text-lg font-bold">&times;</span>
              </button>
            </div>
            <form onSubmit={isEditOpen ? handleEdit : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} {isEditOpen ? 'Save Changes' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Manage Subjects */}
      {isManageSubjectsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-5 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">Manage Subjects for {activeExam?.name}</h3>
              <button onClick={() => setIsManageSubjectsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-lg font-bold">&times;</span>
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 space-y-2 pr-2">
              {allSubjects.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No subjects found in the system.</p>
              ) : (
                allSubjects.map(sub => {
                  const isLinked = examSubjects.some(es => es.id === sub.id);
                  return (
                    <div key={sub.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{sub.name}</span>
                        <span className="text-xs text-gray-500">ID: {sub.id}</span>
                      </div>
                      <button
                        onClick={() => handleToggleSubject(sub.id, isLinked)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                          isLinked 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }`}
                      >
                        {isLinked ? 'Remove' : <><Plus className="w-3 h-3" /> Add</>}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="pt-4 mt-4 flex justify-end shrink-0 border-t border-gray-100">
              <button onClick={() => setIsManageSubjectsOpen(false)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


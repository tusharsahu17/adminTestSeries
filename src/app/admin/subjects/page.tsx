'use client';
import { useEffect, useState } from 'react';
import { adminService } from '../../../services/adminService';
import { Loader2, Plus, ChevronDown, ChevronRight, Folder, FolderOpen, FileText, Edit, Trash2, X } from 'lucide-react';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [topics, setTopics] = useState<Record<string, any[]>>({});
  
  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [parentSubjectId, setParentSubjectId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    is_active: true
  });

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSubjects();
      const subjectData = res.subjects || res.data?.subjects || res.data || res;
      setSubjects(Array.isArray(subjectData) ? subjectData : []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicsForSubject = async (subjectId: string) => {
    try {
      const res = await adminService.getTopics(subjectId);
      const data = res.data?.topics || res.data || res;
      setTopics(prev => ({ ...prev, [subjectId]: Array.isArray(data) ? data : [] }));
    } catch (err) {
      console.error('Failed to fetch topics:', err);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const toggleSubject = async (subjectId: string) => {
    const isExpanded = !!expandedSubjects[subjectId];
    setExpandedSubjects(prev => ({ ...prev, [subjectId]: !isExpanded }));
    
    // Fetch topics if expanding and not already fetched
    if (!isExpanded && !topics[subjectId]) {
      await fetchTopicsForSubject(subjectId);
    }
  };

  // Subject Handlers
  const openCreateSubject = () => {
    setSelectedSubjectId(null);
    setForm({ name: '', description: '', is_active: true });
    setIsSubjectModalOpen(true);
  };

  const openEditSubject = (subject: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSubjectId(subject.id);
    setForm({
      name: subject.name || '',
      description: subject.description || '',
      is_active: subject.is_active !== undefined ? !!subject.is_active : true
    });
    setIsSubjectModalOpen(true);
  };

  const saveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedSubjectId) {
        await adminService.updateSubject(selectedSubjectId, form);
      } else {
        await adminService.createSubject(form);
      }
      setIsSubjectModalOpen(false);
      fetchSubjects();
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save subject');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSubject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this subject?')) {
      try {
        await adminService.deleteSubject(id);
        fetchSubjects();
      } catch (err) {
        alert('Failed to delete subject');
      }
    }
  };

  // Topic Handlers
  const openCreateTopic = (subjectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setParentSubjectId(subjectId);
    setSelectedTopicId(null);
    setForm({ name: '', description: '', is_active: true });
    setIsTopicModalOpen(true);
  };

  const openEditTopic = (subjectId: string, topic: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setParentSubjectId(subjectId);
    setSelectedTopicId(topic.id);
    setForm({
      name: topic.name || '',
      description: topic.description || '',
      is_active: topic.is_active !== undefined ? !!topic.is_active : true
    });
    setIsTopicModalOpen(true);
  };

  const saveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentSubjectId) return;
    setSubmitting(true);
    try {
      if (selectedTopicId) {
        await adminService.updateTopic(selectedTopicId, form);
      } else {
        await adminService.createTopic(parentSubjectId, form);
      }
      setIsTopicModalOpen(false);
      fetchTopicsForSubject(parentSubjectId);
      
      // Ensure the subject is expanded to see the new topic
      setExpandedSubjects(prev => ({ ...prev, [parentSubjectId]: true }));
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save topic');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTopic = async (subjectId: string, topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this topic?')) {
      try {
        await adminService.deleteTopic(topicId);
        fetchTopicsForSubject(subjectId);
      } catch (err) {
        alert('Failed to delete topic');
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subject & Topic Management</h1>
          <p className="text-sm text-gray-500">Manage the hierarchy of subjects, topics, and subtopics.</p>
        </div>
        <button onClick={openCreateSubject} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No subjects found. Create one to get started.</div>
        ) : (
          <div className="space-y-2">
            {subjects.map(subject => (
              <div key={subject.id} className="border border-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group"
                  onClick={() => toggleSubject(subject.id)}
                >
                  <div className="flex items-center gap-3">
                    {expandedSubjects[subject.id] ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                    {expandedSubjects[subject.id] ? <FolderOpen className="w-5 h-5 text-indigo-500" /> : <Folder className="w-5 h-5 text-indigo-500" />}
                    <span className="font-semibold text-gray-900">{subject.name} <span className="text-gray-400 text-xs font-normal">#{subject.id}</span></span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button className="text-xs text-indigo-600 font-medium px-2 py-1 hover:bg-indigo-50 rounded mr-2" onClick={(e) => openCreateTopic(subject.id, e)}>
                      + Add Topic
                    </button>
                    <button onClick={(e) => openEditSubject(subject, e)} className="p-1 text-gray-400 hover:text-indigo-600 transition-colors" title="Edit Subject">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => deleteSubject(subject.id, e)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete Subject">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {expandedSubjects[subject.id] && (
                  <div className="p-4 bg-white pl-12 space-y-3">
                    {!topics[subject.id] ? (
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading topics...
                      </div>
                    ) : topics[subject.id].length === 0 ? (
                      <div className="text-sm text-gray-500 italic">No topics found for this subject.</div>
                    ) : (
                      topics[subject.id].map(topic => (
                        <div key={topic.id} className="flex items-center justify-between p-3 border border-gray-100 rounded bg-gray-50/30 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-800">{topic.name} <span className="text-gray-400 text-xs font-normal">#{topic.id}</span></span>
                          </div>
                          <div className="flex gap-2 items-center">
                            <button onClick={(e) => openEditTopic(subject.id, topic, e)} className="p-1 text-gray-400 hover:text-indigo-600 transition-colors" title="Edit Topic">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => deleteTopic(subject.id, topic.id, e)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete Topic">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">{selectedSubjectId ? 'Edit Subject' : 'Create Subject'}</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} {selectedSubjectId ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topic Modal */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">{selectedTopicId ? 'Edit Topic' : 'Create Topic'}</h3>
              <button onClick={() => setIsTopicModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name *</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsTopicModalOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} {selectedTopicId ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

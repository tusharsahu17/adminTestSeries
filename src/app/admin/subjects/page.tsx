'use client';
import { useEffect, useState } from 'react';
import { adminService } from '../../../services/adminService';
import {
  Loader2,
  Plus,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  Tag,
  Edit,
  Trash2,
  X,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [topics, setTopics] = useState<Record<string, any[]>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [subtopics, setSubtopics] = useState<Record<string, any[]>>({});

  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isSubtopicModalOpen, setIsSubtopicModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string | null>(null);
  const [parentSubjectId, setParentSubjectId] = useState<string | null>(null);
  const [parentTopicId, setParentTopicId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  const [subtopicForm, setSubtopicForm] = useState({
    name: '',
    description: '',
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
      const data = res.topics || res.data?.topics || res.data || res;
      setTopics((prev) => ({ ...prev, [subjectId]: Array.isArray(data) ? data : [] }));
    } catch (err) {
      console.error('Failed to fetch topics:', err);
    }
  };

  const fetchSubtopicsForTopic = async (topicId: string) => {
    try {
      const res = await adminService.getSubtopics(topicId);
      const data = res.subtopics || res.data?.subtopics || res.data || res;
      setSubtopics((prev) => ({ ...prev, [topicId]: Array.isArray(data) ? data : [] }));
    } catch (err) {
      console.error('Failed to fetch subtopics:', err);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const toggleSubject = async (subjectId: string) => {
    const isExpanded = !!expandedSubjects[subjectId];
    setExpandedSubjects((prev) => ({ ...prev, [subjectId]: !isExpanded }));

    // Fetch topics if expanding and not already fetched
    if (!isExpanded && !topics[subjectId]) {
      await fetchTopicsForSubject(subjectId);
    }
  };

  const toggleTopic = async (topicId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isExpanded = !!expandedTopics[topicId];
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !isExpanded }));

    if (!isExpanded && !subtopics[topicId]) {
      await fetchSubtopicsForTopic(topicId);
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
    setSelectedSubjectId(String(subject.id));
    setForm({
      name: subject.name || '',
      description: subject.description || '',
      is_active: subject.is_active !== undefined ? !!subject.is_active : true,
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
    if (confirm('Are you sure you want to delete this subject and its topics?')) {
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
    setSelectedTopicId(String(topic.id));
    setForm({
      name: topic.name || '',
      description: topic.description || '',
      is_active: topic.is_active !== undefined ? !!topic.is_active : true,
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
      setExpandedSubjects((prev) => ({ ...prev, [parentSubjectId]: true }));
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save topic');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTopic = async (subjectId: string, topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this topic and its subtopics?')) {
      try {
        await adminService.deleteTopic(topicId);
        fetchTopicsForSubject(subjectId);
      } catch (err) {
        alert('Failed to delete topic');
      }
    }
  };

  // Subtopic Handlers
  const openCreateSubtopic = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setParentTopicId(topicId);
    setSelectedSubtopicId(null);
    setSubtopicForm({ name: '', description: '' });
    setIsSubtopicModalOpen(true);
  };

  const openEditSubtopic = (topicId: string, subtopic: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setParentTopicId(topicId);
    setSelectedSubtopicId(String(subtopic.id));
    setSubtopicForm({
      name: subtopic.name || '',
      description: subtopic.description || '',
    });
    setIsSubtopicModalOpen(true);
  };

  const saveSubtopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentTopicId) return;
    setSubmitting(true);
    try {
      if (selectedSubtopicId) {
        await adminService.updateSubtopic(selectedSubtopicId, subtopicForm);
      } else {
        await adminService.createSubtopic(parentTopicId, subtopicForm);
      }
      setIsSubtopicModalOpen(false);
      fetchSubtopicsForTopic(parentTopicId);
      setExpandedTopics((prev) => ({ ...prev, [parentTopicId]: true }));
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save subtopic');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSubtopic = async (topicId: string, subtopicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this subtopic?')) {
      try {
        await adminService.deleteSubtopic(subtopicId);
        fetchSubtopicsForTopic(topicId);
      } catch (err) {
        alert('Failed to delete subtopic');
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subject & Topic Hierarchy</h1>
          <p className="text-sm text-gray-500">
            Organize subjects into topics and granular subtopics for precision topic-wise testing.
          </p>
        </div>
        <button
          onClick={openCreateSubject}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </header>

      {/* Overview helper banner */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center gap-3 text-xs text-indigo-900">
        <Layers className="w-5 h-5 text-indigo-600 shrink-0" />
        <div>
          <span className="font-semibold">3-Tier Hierarchy:</span> Subjects &rarr; Topics &rarr; Subtopics.
          When creating a <strong>Topic-Wise Test</strong>, you can target specific topics and subtopics
          created here.
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No subjects found. Create one to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {subjects.map((subject) => {
              const subjectIdStr = String(subject.id);
              const isSubExpanded = !!expandedSubjects[subjectIdStr];
              const subjectTopics = topics[subjectIdStr];

              return (
                <div
                  key={subject.id}
                  className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs transition-all"
                >
                  {/* LEVEL 1: SUBJECT HEADER */}
                  <div
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                      isSubExpanded ? 'bg-indigo-50/40 border-b border-gray-200' : 'bg-gray-50 hover:bg-gray-100/80'
                    }`}
                    onClick={() => toggleSubject(subjectIdStr)}
                  >
                    <div className="flex items-center gap-3">
                      {isSubExpanded ? (
                        <ChevronDown className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      {isSubExpanded ? (
                        <FolderOpen className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <Folder className="w-5 h-5 text-indigo-500" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{subject.name}</span>
                          <span className="text-gray-400 text-xs font-mono">#{subject.id}</span>
                          {subjectTopics && (
                            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                              {subjectTopics.length} topic{subjectTopics.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {subject.description && (
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{subject.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="text-xs text-indigo-700 font-semibold px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1 transition-colors border border-indigo-200/50"
                        onClick={(e) => openCreateTopic(subjectIdStr, e)}
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Topic
                      </button>
                      <button
                        onClick={(e) => openEditSubject(subject, e)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                        title="Edit Subject"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => deleteSubject(subjectIdStr, e)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* LEVEL 2: TOPICS CONTAINER */}
                  {isSubExpanded && (
                    <div className="p-4 bg-white pl-8 sm:pl-12 space-y-3">
                      {!subjectTopics ? (
                        <div className="text-xs text-gray-500 flex items-center gap-2 py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> Loading topics...
                        </div>
                      ) : subjectTopics.length === 0 ? (
                        <div className="text-xs text-gray-500 italic py-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                          No topics found under this subject yet. Click &quot;+ Add Topic&quot; above to create one.
                        </div>
                      ) : (
                        subjectTopics.map((topic) => {
                          const topicIdStr = String(topic.id);
                          const isTopicExpanded = !!expandedTopics[topicIdStr];
                          const topicSubtopics = subtopics[topicIdStr];

                          return (
                            <div
                              key={topic.id}
                              className="border border-gray-150 rounded-lg overflow-hidden bg-white shadow-2xs"
                            >
                              {/* TOPIC HEADER ROW */}
                              <div
                                className="flex items-center justify-between p-3 bg-gray-50/70 hover:bg-gray-100/80 cursor-pointer transition-colors"
                                onClick={(e) => toggleTopic(topicIdStr, e)}
                              >
                                <div className="flex items-center gap-2.5">
                                  {isTopicExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-indigo-500" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  )}
                                  <FileText className="w-4 h-4 text-indigo-600" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-gray-900">{topic.name}</span>
                                      <span className="text-gray-400 text-xs font-mono">#{topic.id}</span>
                                      {topic.is_active === false && (
                                        <span className="text-2xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                                          Inactive
                                        </span>
                                      )}
                                      {topicSubtopics && (
                                        <span className="text-2xs font-medium px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                                          {topicSubtopics.length} subtopic{topicSubtopics.length !== 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </div>
                                    {topic.description && (
                                      <p className="text-2xs text-gray-500 line-clamp-1">{topic.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1.5 items-center" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={(e) => openCreateSubtopic(topicIdStr, e)}
                                    className="text-2xs text-emerald-700 font-semibold px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200/60 flex items-center gap-1 transition-colors"
                                  >
                                    <Plus className="w-3 h-3" /> Add Subtopic
                                  </button>
                                  <button
                                    onClick={(e) => openEditTopic(subjectIdStr, topic, e)}
                                    className="p-1 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                                    title="Edit Topic"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => deleteTopic(subjectIdStr, topicIdStr, e)}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                    title="Delete Topic"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* LEVEL 3: SUBTOPICS LIST */}
                              {isTopicExpanded && (
                                <div className="p-3 bg-gray-50/30 pl-8 space-y-2 border-t border-gray-100">
                                  {!topicSubtopics ? (
                                    <div className="text-2xs text-gray-500 flex items-center gap-1.5 py-1">
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                      Loading subtopics...
                                    </div>
                                  ) : topicSubtopics.length === 0 ? (
                                    <div className="text-2xs text-gray-400 italic py-1">
                                      No subtopics under this topic. Click &quot;+ Add Subtopic&quot; to create one.
                                    </div>
                                  ) : (
                                    topicSubtopics.map((subtopic) => (
                                      <div
                                        key={subtopic.id}
                                        className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Tag className="w-3.5 h-3.5 text-emerald-600" />
                                          <div>
                                            <span className="text-xs font-medium text-gray-800">
                                              {subtopic.name}
                                            </span>
                                            <span className="text-gray-400 text-2xs font-mono ml-1.5">
                                              #{subtopic.id}
                                            </span>
                                            {subtopic.description && (
                                              <p className="text-2xs text-gray-500 line-clamp-1">
                                                {subtopic.description}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex gap-1 items-center">
                                          <button
                                            onClick={(e) => openEditSubtopic(topicIdStr, subtopic, e)}
                                            className="p-1 text-gray-400 hover:text-emerald-600 rounded"
                                            title="Edit Subtopic"
                                          >
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={(e) =>
                                              deleteSubtopic(topicIdStr, String(subtopic.id), e)
                                            }
                                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                                            title="Delete Subtopic"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {selectedSubjectId ? 'Edit Subject' : 'Create Subject'}
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Quantitative Aptitude and Numerical Ability"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm shadow-xs"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}{' '}
                  {selectedSubjectId ? 'Save Changes' : 'Create Subject'}
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
              <h3 className="text-lg font-bold text-gray-900">
                {selectedTopicId ? 'Edit Topic' : 'Create Topic under Subject'}
              </h3>
              <button
                onClick={() => setIsTopicModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Percentage"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Concepts, fraction conversions, price & consumption"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Active Topic (available for tests)</span>
                </label>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm shadow-xs"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}{' '}
                  {selectedTopicId ? 'Save Changes' : 'Create Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subtopic Modal */}
      {isSubtopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {selectedSubtopicId ? 'Edit Subtopic' : 'Create Subtopic under Topic'}
              </h3>
              <button
                onClick={() => setIsSubtopicModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveSubtopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtopic Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Price, Consumption & Expenditure"
                  value={subtopicForm.name}
                  onChange={(e) => setSubtopicForm({ ...subtopicForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Problems on percentage increase and expenditure balance"
                  value={subtopicForm.description}
                  onChange={(e) =>
                    setSubtopicForm({ ...subtopicForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsSubtopicModalOpen(false)}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm shadow-xs"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}{' '}
                  {selectedSubtopicId ? 'Save Changes' : 'Create Subtopic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

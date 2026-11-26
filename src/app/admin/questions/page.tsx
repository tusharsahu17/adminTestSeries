'use client';
import { useEffect, useState, useRef } from 'react';
import { adminService } from '../../../services/adminService';
import {
  Loader2,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Upload,
  HelpCircle,
  X,
  Eye,
  FileText,
  Tag,
  Folder,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectTopicsMap, setSubjectTopicsMap] = useState<Record<string, any[]>>({});
  const [topicSubtopicsMap, setTopicSubtopicsMap] = useState<Record<string, any[]>>({});

  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingSubtopics, setLoadingSubtopics] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTestFilter, setSelectedTestFilter] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form (Step 6 Option 3: test_id, subject_id, topic_id, subtopic_id, question_text, question_type, marks, negative_marks, difficulty, explanation, options)
  const [form, setForm] = useState<{
    test_id: string;
    subject_id: string;
    topic_id: string;
    subtopic_id: string;
    question_text: string;
    question_type: string;
    marks: number | '';
    negative_marks: number | '';
    difficulty: string;
    explanation: string;
    options: {
      option_text: string;
      option_key: string;
      is_correct: boolean;
      display_order: number;
    }[];
  }>({
    test_id: '',
    subject_id: '',
    topic_id: '',
    subtopic_id: '',
    question_text: '',
    question_type: 'MCQ',
    marks: 2,
    negative_marks: 0.5,
    difficulty: 'Medium',
    explanation: '',
    options: [
      { option_text: '', option_key: 'A', is_correct: true, display_order: 1 },
      { option_text: '', option_key: 'B', is_correct: false, display_order: 2 },
      { option_text: '', option_key: 'C', is_correct: false, display_order: 3 },
      { option_text: '', option_key: 'D', is_correct: false, display_order: 4 },
    ],
  });

  const loadTopicsForSubject = async (subjectId: string | number) => {
    const sId = String(subjectId);
    if (!sId || subjectTopicsMap[sId]) return;
    setLoadingTopics(true);
    try {
      const res = await adminService.getTopics(sId);
      const data = res.topics || res.data?.topics || res.data || res;
      setSubjectTopicsMap((prev) => ({
        ...prev,
        [sId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      console.error('Failed to load topics for subject:', err);
    } finally {
      setLoadingTopics(false);
    }
  };

  const loadSubtopicsForTopic = async (topicId: string | number) => {
    const tId = String(topicId);
    if (!tId || topicSubtopicsMap[tId]) return;
    setLoadingSubtopics(true);
    try {
      const res = await adminService.getSubtopics(tId);
      const data = res.subtopics || res.data?.subtopics || res.data || res;
      setTopicSubtopicsMap((prev) => ({
        ...prev,
        [tId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      console.error('Failed to load subtopics for topic:', err);
    } finally {
      setLoadingSubtopics(false);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedTestFilter) params.test_id = selectedTestFilter;
      if (selectedSubjectFilter) params.subject_id = selectedSubjectFilter;
      if (selectedTopicFilter) params.topic_id = selectedTopicFilter;
      if (selectedDifficultyFilter) params.difficulty = selectedDifficultyFilter;

      const res = await adminService.getQuestions(params);
      const data = res.questions || res.data?.questions || res.data || res;
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestsAndSubjects = async () => {
    try {
      const [testRes, subRes] = await Promise.all([
        adminService.getTests(),
        adminService.getSubjects(),
      ]);
      const testList = testRes.tests || testRes.data?.tests || testRes.data || testRes;
      setTests(Array.isArray(testList) ? testList : []);

      const subList = subRes.subjects || subRes.data?.subjects || subRes.data || subRes;
      setSubjects(Array.isArray(subList) ? subList : []);
    } catch (err) {
      console.error('Failed to fetch tests and subjects:', err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [searchTerm, selectedTestFilter, selectedSubjectFilter, selectedTopicFilter, selectedDifficultyFilter]);

  useEffect(() => {
    fetchTestsAndSubjects();
  }, []);

  const getTestTitle = (testId: string | number) => {
    if (!testId) return null;
    const found = tests.find((t) => String(t.id) === String(testId));
    return found ? found.title || found.name : `Test #${testId}`;
  };

  const getSubjectName = (subjectId: string | number) => {
    if (!subjectId) return null;
    const found = subjects.find((s) => String(s.id) === String(subjectId));
    return found ? found.name : `Subject #${subjectId}`;
  };

  const handleSubjectChangeInForm = async (subId: string) => {
    setForm((prev) => ({
      ...prev,
      subject_id: subId,
      topic_id: '',
      subtopic_id: '',
    }));
    if (subId) {
      await loadTopicsForSubject(subId);
    }
  };

  const handleTopicChangeInForm = async (topId: string) => {
    setForm((prev) => ({
      ...prev,
      topic_id: topId,
      subtopic_id: '',
    }));
    if (topId) {
      await loadSubtopicsForTopic(topId);
    }
  };

  const resetForm = () => {
    setForm({
      test_id: '',
      subject_id: '',
      topic_id: '',
      subtopic_id: '',
      question_text: '',
      question_type: 'MCQ',
      marks: 2,
      negative_marks: 0.5,
      difficulty: 'Medium',
      explanation: '',
      options: [
        { option_text: '', option_key: 'A', is_correct: true, display_order: 1 },
        { option_text: '', option_key: 'B', is_correct: false, display_order: 2 },
        { option_text: '', option_key: 'C', is_correct: false, display_order: 3 },
        { option_text: '', option_key: 'D', is_correct: false, display_order: 4 },
      ],
    });
    setSelectedQuestionId(null);
  };

  const openViewModal = async (q: any) => {
    let fullQuestion = q;
    try {
      fullQuestion = await adminService.getQuestion(q.id);
    } catch (err) {
      console.warn('Failed to fetch full question details for viewing.');
    }
    setViewData(fullQuestion);
    setIsViewOpen(true);
  };

  const openEditModal = async (q: any) => {
    setSelectedQuestionId(String(q.id));

    let fullQuestion = q;
    try {
      fullQuestion = await adminService.getQuestion(q.id);
    } catch (err) {
      console.warn('Failed to fetch full question details. Using basic info.');
    }

    const sId = fullQuestion.subject_id ? String(fullQuestion.subject_id) : '';
    const tId = fullQuestion.topic_id ? String(fullQuestion.topic_id) : '';
    const stId = fullQuestion.subtopic_id ? String(fullQuestion.subtopic_id) : '';

    if (sId) loadTopicsForSubject(sId);
    if (tId) loadSubtopicsForTopic(tId);

    setForm({
      test_id: fullQuestion.test_id ? String(fullQuestion.test_id) : '',
      subject_id: sId,
      topic_id: tId,
      subtopic_id: stId,
      question_text: fullQuestion.question_text || fullQuestion.question || '',
      question_type: fullQuestion.question_type || fullQuestion.type || 'MCQ',
      marks: fullQuestion.marks ?? 2,
      negative_marks: fullQuestion.negative_marks ?? 0.5,
      difficulty: fullQuestion.difficulty || 'Medium',
      explanation: fullQuestion.explanation || '',
      options:
        fullQuestion.options && fullQuestion.options.length > 0
          ? fullQuestion.options
          : [
              { option_text: '', option_key: 'A', is_correct: true, display_order: 1 },
              { option_text: '', option_key: 'B', is_correct: false, display_order: 2 },
              { option_text: '', option_key: 'C', is_correct: false, display_order: 3 },
              { option_text: '', option_key: 'D', is_correct: false, display_order: 4 },
            ],
    });
    setIsEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question_text) return alert('Question text is required');
    setSubmitting(true);
    try {
      const payload: any = {
        question_text: form.question_text,
        question_type: form.question_type,
        marks: form.marks === '' ? 2 : Number(form.marks),
        negative_marks: form.negative_marks === '' ? 0.5 : Number(form.negative_marks),
        difficulty: form.difficulty,
        explanation: form.explanation,
        options: form.options,
        test_id: form.test_id ? parseInt(form.test_id, 10) : null,
      };

      if (form.subject_id) {
        payload.subject_id = parseInt(form.subject_id, 10);
        payload.subject = getSubjectName(form.subject_id);
      }
      if (form.topic_id) {
        payload.topic_id = parseInt(form.topic_id, 10);
      }
      if (form.subtopic_id) {
        payload.subtopic_id = parseInt(form.subtopic_id, 10);
      }

      await adminService.createQuestion(payload);
      alert('Question created with topic tagging successfully!');
      setIsCreateOpen(false);
      resetForm();
      fetchQuestions();
    } catch (err: any) {
      console.error('Failed to create question:', err);
      alert(err.response?.data?.error || 'Failed to create question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestionId) return;
    setSubmitting(true);
    try {
      const payload: any = {
        question_text: form.question_text,
        question_type: form.question_type,
        marks: form.marks === '' ? 2 : Number(form.marks),
        negative_marks: form.negative_marks === '' ? 0.5 : Number(form.negative_marks),
        difficulty: form.difficulty,
        explanation: form.explanation,
        options: form.options,
        test_id: form.test_id ? parseInt(form.test_id, 10) : null,
      };

      if (form.subject_id) {
        payload.subject_id = parseInt(form.subject_id, 10);
        payload.subject = getSubjectName(form.subject_id);
      }
      if (form.topic_id) {
        payload.topic_id = parseInt(form.topic_id, 10);
      }
      if (form.subtopic_id) {
        payload.subtopic_id = parseInt(form.subtopic_id, 10);
      }

      await adminService.updateQuestion(selectedQuestionId, payload);
      alert('Question updated successfully!');
      setIsEditOpen(false);
      resetForm();
      fetchQuestions();
    } catch (err: any) {
      console.error('Failed to update question:', err);
      alert(err.response?.data?.error || 'Failed to update question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await adminService.deleteQuestion(String(id));
        alert('Question deleted successfully');
        fetchQuestions();
      } catch (err) {
        console.error('Failed to delete question:', err);
        alert('Failed to delete question');
      }
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return alert('Please select a file to upload');

    const formData = new FormData();
    formData.append('file', file);

    setSubmitting(true);
    try {
      await adminService.bulkUploadQuestions(formData);
      alert('Questions uploaded successfully');
      setIsUploadOpen(false);
      fetchQuestions();
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const setCorrectOption = (index: number) => {
    const newOptions = form.options.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    }));
    setForm({ ...form, options: newOptions });
  };

  const currentAvailableTopics = form.subject_id ? subjectTopicsMap[form.subject_id] || [] : [];
  const currentAvailableSubtopics = form.topic_id ? topicSubtopicsMap[form.topic_id] || [] : [];

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Bank & Tagging</h1>
          <p className="text-sm text-gray-500">
            Create questions tagged with Subject, Topic, and Subtopic for precise topic-wise testing.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
          >
            <Upload className="w-4 h-4" /> Bulk Upload (CSV)
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </header>

      {/* FILTER BAR */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px] max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions by text or explanation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Filter */}
            <div className="flex items-center gap-1">
              {/* <span className="text-2xs font-semibold text-gray-500">Subject:</span> */}
              <select
                value={selectedSubjectFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedSubjectFilter(val);
                  setSelectedTopicFilter('');
                  if (val) loadTopicsForSubject(val);
                }}
                className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Filter */}
            {selectedSubjectFilter && subjectTopicsMap[selectedSubjectFilter]?.length > 0 && (
              <div className="flex items-center gap-1 animate-in fade-in">
                <span className="text-2xs font-semibold text-gray-500">Topic:</span>
                <select
                  value={selectedTopicFilter}
                  onChange={(e) => setSelectedTopicFilter(e.target.value)}
                  className="px-2 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-700"
                >
                  <option value="">All Topics</option>
                  {subjectTopicsMap[selectedSubjectFilter].map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Test Filter */}
            <div className="flex items-center gap-1">
              {/* <span className="text-2xs font-semibold text-gray-500">Test:</span> */}
              <select
                value={selectedTestFilter}
                onChange={(e) => setSelectedTestFilter(e.target.value)}
                className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 max-w-[160px] truncate"
              >
                <option value="">All (Bank & Tests)</option>
                {tests.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title || t.name} (#{t.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1">
              {/* <span className="text-2xs font-semibold text-gray-500">Diff:</span> */}
              <select
                value={selectedDifficultyFilter}
                onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
                className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
              >
                <option value="">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {(searchTerm || selectedSubjectFilter || selectedTopicFilter || selectedTestFilter || selectedDifficultyFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubjectFilter('');
                  setSelectedTopicFilter('');
                  setSelectedTestFilter('');
                  setSelectedDifficultyFilter('');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </section>

      {/* QUESTIONS TABLE */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Question Text</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Topic Tagging</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Test</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Diff</th>
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
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-xs">
                    No questions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-5 text-xs font-mono text-gray-500">#{q.id}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-start gap-2.5 max-w-md">
                        {/* <HelpCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" /> */}
                        <div>
                          <p className="font-semibold text-gray-900 text-xs line-clamp-2">
                            {q.question_text || q.text || q.question}
                          </p>
                          <div className="flex items-center gap-2 text-3xs text-gray-500 mt-1">
                            <span>Marks: <strong>{q.marks || 2}</strong></span>
                            <span>&bull;</span>
                            <span>Neg: <strong className="text-rose-600">-{q.negative_marks || 0.5}</strong></span>
                            <span>&bull;</span>
                            <span>Type: {q.question_type || 'MCQ'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1 font-semibold text-gray-900">
                          <Folder className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{q.subject?.name || q.subject || getSubjectName(q.subject_id) || 'Unassigned'}</span>
                        </div>
                        {(q.topic?.name || q.topic) && (
                          <div className="flex items-center gap-1 text-2xs text-indigo-700 font-medium">
                            <Tag className="w-3 h-3 text-indigo-500" />
                            <span>{q.topic?.name || q.topic}</span>
                          </div>
                        )}
                        {(q.subtopic?.name || q.subtopic) && (
                          <div className="text-3xs text-emerald-700 font-medium pl-4">
                            &bull; {q.subtopic?.name || q.subtopic}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      {q.test_id ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <FileText className="w-3 h-3 text-indigo-600" />
                          <span className="truncate max-w-[130px]">{getTestTitle(q.test_id)}</span>
                        </span>
                      ) : (
                        <span className="text-2xs text-gray-400 italic">General Bank</span>
                      )}
                    </td>
                    <td className="py-3 px-5">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                          q.difficulty === 'hard' || q.difficulty === 'Hard'
                            ? 'bg-rose-100 text-rose-700'
                            : q.difficulty === 'medium' || q.difficulty === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {q.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openViewModal(q)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(q)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Bulk Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Bulk Upload Questions</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBulkUpload} className="space-y-4">
              <p className="text-xs text-gray-500">
                Upload a CSV or Excel file with question text, options, correct answer, subject, topic, subtopic, marks, and difficulty.
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select File</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Upload</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT QUESTION MODAL (Step 6 Option 3) */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {isEditOpen ? 'Edit Question' : 'Create Question with Topic Tagging'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditOpen ? handleEdit : handleCreate} className="space-y-4 text-xs">
              {/* Optional Test Assignment */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Assign to Specific Test (Optional)
                </label>
                <select
                  value={form.test_id}
                  onChange={(e) => setForm({ ...form, test_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">None (Master Question Bank)</option>
                  {tests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title || t.name} (#{t.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Hierarchy Cascade: Subject -> Topic -> Subtopic */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
                <span className="text-3xs font-bold uppercase tracking-wider text-gray-500 block">
                  Topic Tagging
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-2xs font-bold text-gray-700 mb-1">Subject</label>
                    <select
                      value={form.subject_id}
                      onChange={(e) => handleSubjectChangeInForm(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-2xs font-bold text-gray-700">Topic</label>
                      {loadingTopics && <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />}
                    </div>
                    <select
                      value={form.topic_id}
                      onChange={(e) => handleTopicChangeInForm(e.target.value)}
                      disabled={!form.subject_id}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white disabled:bg-gray-100"
                    >
                      <option value="">
                        {!form.subject_id ? 'First choose subject' : 'Select Topic'}
                      </option>
                      {currentAvailableTopics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-2xs font-bold text-gray-700">Subtopic</label>
                      {loadingSubtopics && <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />}
                    </div>
                    <select
                      value={form.subtopic_id}
                      onChange={(e) => setForm({ ...form, subtopic_id: e.target.value })}
                      disabled={!form.topic_id}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white disabled:bg-gray-100"
                    >
                      <option value="">
                        {!form.topic_id ? 'First choose topic' : 'Select Subtopic'}
                      </option>
                      {currentAvailableSubtopics.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.question_text}
                  onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. If the price of sugar increases by 25%, by what percent must a family decrease consumption?"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">Options (Select Correct Answer)</label>
                {form.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border ${
                      opt.is_correct ? 'border-emerald-500 bg-emerald-50/40' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="correct_option_bank"
                      checked={opt.is_correct}
                      onChange={() => setCorrectOption(idx)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-gray-600 w-4">{opt.option_key}.</span>
                    <input
                      type="text"
                      required
                      value={opt.option_text}
                      onChange={(e) => {
                        const newOpts = [...form.options];
                        newOpts[idx].option_text = e.target.value;
                        setForm({ ...form, options: newOpts });
                      }}
                      className="flex-1 px-2.5 py-1 border border-gray-300 rounded text-xs"
                      placeholder={`Option ${opt.option_key} text...`}
                    />
                  </div>
                ))}
              </div>

              {/* Marks, Negative, Difficulty, Type */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Marks</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.marks}
                    onChange={(e) =>
                      setForm({ ...form, marks: e.target.value === '' ? '' : Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Negative Marks</label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={form.negative_marks}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        negative_marks: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Type</label>
                  <select
                    value={form.question_type}
                    onChange={(e) => setForm({ ...form, question_type: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="Numerical">Numerical</option>
                  </select>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Explanation</label>
                <textarea
                  rows={2}
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Required reduction = [25 / (100 + 25)] * 100 = 20%."
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setIsEditOpen(false);
                  }}
                  className="px-4 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isEditOpen ? 'Save Changes' : 'Create Question'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {isViewOpen && viewData && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Question Preview</h3>
              <button onClick={() => setIsViewOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="font-semibold text-gray-900 text-sm">
                  {viewData.question_text || viewData.text || viewData.question}
                </p>
                <div className="flex items-center gap-2 text-2xs text-gray-500 mt-2 flex-wrap">
                  <span className="font-mono text-gray-400">ID: #{viewData.id}</span>
                  <span>&bull;</span>
                  <span>Marks: {viewData.marks || 2}</span>
                  <span>&bull;</span>
                  <span>Neg: -{viewData.negative_marks || 0.5}</span>
                  <span>&bull;</span>
                  <span className="font-semibold text-indigo-700 uppercase">
                    {viewData.difficulty || 'Medium'}
                  </span>
                </div>
              </div>

              {viewData.options && (
                <div className="space-y-1.5">
                  <span className="text-2xs font-bold text-gray-500 uppercase tracking-wider block">
                    Options:
                  </span>
                  {viewData.options.map((opt: any) => (
                    <div
                      key={opt.id || opt.option_key}
                      className={`p-2 rounded-lg flex items-center justify-between ${
                        opt.is_correct
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold'
                          : 'bg-white border border-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4">{opt.option_key}.</span>
                        <span>{opt.option_text}</span>
                      </div>
                      {opt.is_correct && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                  ))}
                </div>
              )}

              {viewData.explanation && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold block mb-0.5">Explanation:</span>
                  <p>{viewData.explanation}</p>
                </div>
              )}
            </div>

            <div className="pt-3 mt-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg text-xs hover:bg-gray-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { adminService } from '../../../services/adminService';
import {
  Loader2,
  Search,
  Plus,
  Edit,
  Copy,
  Trash2,
  Clock,
  CheckCircle,
  FileText,
  Eye,
  X,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Layers,
  Sparkles,
} from 'lucide-react';
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

  // Staged questions for Create / Edit modal
  const [stagedQuestions, setStagedQuestions] = useState<any[]>([]);
  const [originalStagedQuestionIds, setOriginalStagedQuestionIds] = useState<Set<number>>(new Set());

  // Sub-modal: Pick from Bank during Create / Edit Test
  const [isPickFromBankOpen, setIsPickFromBankOpen] = useState(false);
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [availableBankQuestions, setAvailableBankQuestions] = useState<any[]>([]);
  const [loadingBankForPicker, setLoadingBankForPicker] = useState(false);
  const [selectedBankIdsToAdd, setSelectedBankIdsToAdd] = useState<Set<number>>(new Set());

  // Sub-modal: Quick Create Question during Create / Edit Test
  const [isQuickCreateQuestionOpen, setIsQuickCreateQuestionOpen] = useState(false);
  const [quickQuestionForm, setQuickQuestionForm] = useState({
    question_text: '',
    question_type: 'MCQ',
    marks: 1,
    negative_marks: 0,
    difficulty: 'Medium',
    explanation: '',
    topic: '',
    options: [
      { option_text: '', option_key: 'A', is_correct: true, display_order: 1 },
      { option_text: '', option_key: 'B', is_correct: false, display_order: 2 },
      { option_text: '', option_key: 'C', is_correct: false, display_order: 3 },
      { option_text: '', option_key: 'D', is_correct: false, display_order: 4 },
    ],
  });

  // Dedicated Manage Questions Modal states (from table action)
  const [isManageQuestionsOpen, setIsManageQuestionsOpen] = useState(false);
  const [activeTestForQuestions, setActiveTestForQuestions] = useState<any>(null);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [loadingTestQuestions, setLoadingTestQuestions] = useState(false);
  const [questionTab, setQuestionTab] = useState<'linked' | 'bank' | 'create'>('linked');

  // Dedicated modal bank questions state
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [loadingBankQuestions, setLoadingBankQuestions] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [selectedBankQuestionIds, setSelectedBankQuestionIds] = useState<Set<number>>(new Set());
  const [addingFromBank, setAddingFromBank] = useState(false);

  // Dedicated modal new question form
  const [newQuestionForm, setNewQuestionForm] = useState({
    question_text: '',
    question_type: 'MCQ',
    marks: 1,
    negative_marks: 0,
    difficulty: 'Medium',
    explanation: '',
    topic: '',
    options: [
      { option_text: '', option_key: 'A', is_correct: true, display_order: 1 },
      { option_text: '', option_key: 'B', is_correct: false, display_order: 2 },
      { option_text: '', option_key: 'C', is_correct: false, display_order: 3 },
      { option_text: '', option_key: 'D', is_correct: false, display_order: 4 },
    ],
  });
  const [creatingQuestion, setCreatingQuestion] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: '',
    duration: 60,
    total_marks: 100,
    passing_marks: 33,
    subject_id: '',
    is_published: false,
    questions_count: 0,
  });

  const getSubjectName = (subjectId: string | number) => {
    if (!subjectId) return 'Unassigned';
    const sub = subjects.find((s) => String(s.id) === String(subjectId));
    return sub ? sub.name : `Subject #${subjectId}`;
  };

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

  // Keep questions_count in sync with stagedQuestions during create/edit
  useEffect(() => {
    if (isCreateOpen || isEditOpen) {
      setForm((prev) => ({
        ...prev,
        questions_count: stagedQuestions.length,
      }));
    }
  }, [stagedQuestions.length, isCreateOpen, isEditOpen]);

  // Load available questions when picker modal opens during Create / Edit
  useEffect(() => {
    if (isPickFromBankOpen) {
      const loadPickerQuestions = async () => {
        setLoadingBankForPicker(true);
        try {
          const res = await adminService.getQuestions({ search: bankSearchTerm });
          const data = res?.questions || res?.data?.questions || res?.data || res;
          const all: any[] = Array.isArray(data) ? data : [];
          // Filter out questions already in stagedQuestions
          const stagedIds = new Set(stagedQuestions.filter((q) => q.id).map((q) => Number(q.id)));
          setAvailableBankQuestions(all.filter((q) => !stagedIds.has(Number(q.id))));
        } catch (err) {
          console.error('Failed to load bank questions for picker:', err);
        } finally {
          setLoadingBankForPicker(false);
        }
      };
      loadPickerQuestions();
    }
  }, [isPickFromBankOpen, bankSearchTerm, stagedQuestions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.subject_id) return alert('Title and Subject are required');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        name: form.title,
        subject_id: parseInt(form.subject_id, 10),
        total_questions: stagedQuestions.length > 0 ? stagedQuestions.length : form.questions_count,
        duration_minutes: form.duration,
      };
      const res: any = await adminService.createTest(payload);
      const newTestId = res?.testId || res?.data?.testId || res?.id;

      // Attach staged questions if any
      if (newTestId && stagedQuestions.length > 0) {
        const subjectName = getSubjectName(form.subject_id);
        for (const q of stagedQuestions) {
          if (q.is_new_draft) {
            // Create new question with this test_id
            await adminService.createQuestion({
              ...q,
              test_id: newTestId,
              subject: subjectName,
            });
          } else if (q.id) {
            // Link existing question from bank to this test
            await adminService.updateQuestion(String(q.id), { test_id: newTestId });
          }
        }
      }

      alert(
        `Test created successfully${
          stagedQuestions.length > 0 ? ` with ${stagedQuestions.length} question(s)` : ''
        }!`
      );
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
    if (!form.title || !selectedTestId || !form.subject_id)
      return alert('Title and Subject are required');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        name: form.title,
        subject_id: parseInt(form.subject_id, 10),
        total_questions: stagedQuestions.length,
        duration_minutes: form.duration,
      };
      await adminService.updateTest(selectedTestId, payload);

      // Handle questions diffing
      const currentIds = new Set(
        stagedQuestions.filter((q) => !q.is_new_draft && q.id).map((q) => Number(q.id))
      );

      // 1. Unlink removed questions
      for (const origId of originalStagedQuestionIds) {
        if (!currentIds.has(origId)) {
          await adminService.updateQuestion(String(origId), { test_id: null });
        }
      }

      // 2. Link newly added bank questions and create newly drafted questions
      const subjectName = getSubjectName(form.subject_id);
      for (const q of stagedQuestions) {
        if (q.is_new_draft) {
          await adminService.createQuestion({
            ...q,
            test_id: selectedTestId,
            subject: subjectName,
          });
        } else if (q.id && !originalStagedQuestionIds.has(Number(q.id))) {
          await adminService.updateQuestion(String(q.id), { test_id: selectedTestId });
        }
      }

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

  const handleDuplicate = async (id: string | number) => {
    if (confirm('Create a duplicate copy of this test?')) {
      try {
        await adminService.duplicateTest(id);
        alert('Test duplicated successfully');
        fetchTests();
      } catch (err) {
        console.error('Duplicate failed:', err);
        alert('Failed to duplicate test');
      }
    }
  };

  const openEditModal = async (item: any) => {
    setSelectedTestId(item.id);
    setForm({
      title: item.title || item.name || '',
      duration: item.duration_minutes || item.duration || 60,
      total_marks: item.total_marks || 100,
      passing_marks: item.passing_marks || 33,
      subject_id: item.subject_id || '',
      is_published: !!item.is_published,
      questions_count: item.total_questions || item.questions_count || 0,
    });

    // Load existing questions for this test into stagedQuestions
    try {
      let loaded: any[] = [];
      const res = await adminService.getTestDetails(item.id);
      loaded = res?.questions || res?.data?.questions || [];
      if (!loaded || loaded.length === 0) {
        const qRes = await adminService.getQuestions({ test_id: item.id });
        const qData = qRes?.questions || qRes?.data?.questions || qRes?.data || qRes;
        loaded = Array.isArray(qData) ? qData : [];
      }
      setStagedQuestions(loaded);
      setOriginalStagedQuestionIds(new Set(loaded.map((q) => Number(q.id))));
    } catch (e) {
      setStagedQuestions([]);
      setOriginalStagedQuestionIds(new Set());
    }

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
      questions_count: 0,
    });
    setSelectedTestId(null);
    setStagedQuestions([]);
    setOriginalStagedQuestionIds(new Set());
  };

  // --- STAGED QUESTIONS HANDLERS (DURING CREATE / EDIT) ---

  const handleAddSelectedFromPicker = () => {
    const toAdd = availableBankQuestions.filter((q) => selectedBankIdsToAdd.has(Number(q.id)));
    setStagedQuestions((prev) => [...prev, ...toAdd]);
    setIsPickFromBankOpen(false);
    setSelectedBankIdsToAdd(new Set());
    setBankSearchTerm('');
  };

  const handleAddQuickDraftQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuestionForm.question_text.trim()) {
      return alert('Question text is required');
    }
    const newQuestion = {
      ...quickQuestionForm,
      is_new_draft: true,
      id: `draft-${Date.now()}`,
    };
    setStagedQuestions((prev) => [...prev, newQuestion]);
    setIsQuickCreateQuestionOpen(false);
    // Reset quick draft form
    setQuickQuestionForm({
      question_text: '',
      question_type: 'MCQ',
      marks: 1,
      negative_marks: 0,
      difficulty: 'Medium',
      explanation: '',
      topic: '',
      options: [
        { option_text: '', option_key: 'A', is_correct: true, display_order: 1 },
        { option_text: '', option_key: 'B', is_correct: false, display_order: 2 },
        { option_text: '', option_key: 'C', is_correct: false, display_order: 3 },
        { option_text: '', option_key: 'D', is_correct: false, display_order: 4 },
      ],
    });
  };

  // --- DEDICATED MANAGE QUESTIONS MODAL LOGIC (TABLE ACTION) ---

  const fetchTestQuestions = async (testId: string | number) => {
    setLoadingTestQuestions(true);
    try {
      let loaded: any[] = [];
      try {
        const res = await adminService.getTestDetails(testId);
        loaded = res?.questions || res?.data?.questions || [];
      } catch (e) {
        // Fallback
      }

      if (!loaded || loaded.length === 0) {
        const qRes = await adminService.getQuestions({ test_id: testId });
        const qData = qRes?.questions || qRes?.data?.questions || qRes?.data || qRes;
        loaded = Array.isArray(qData) ? qData : [];
      }

      setTestQuestions(loaded);
      // Sync local tests state with question count
      setTests((prev) =>
        prev.map((t) =>
          String(t.id) === String(testId)
            ? { ...t, total_questions: loaded.length, questions_count: loaded.length }
            : t
        )
      );
    } catch (err) {
      console.error('Failed to fetch test questions:', err);
    } finally {
      setLoadingTestQuestions(false);
    }
  };

  const fetchBankQuestions = async () => {
    setLoadingBankQuestions(true);
    try {
      const res = await adminService.getQuestions({ search: bankSearch });
      const data = res?.questions || res?.data?.questions || res?.data || res;
      const all: any[] = Array.isArray(data) ? data : [];
      const currentIds = new Set(testQuestions.map((q) => Number(q.id)));
      const available = all.filter((q) => !currentIds.has(Number(q.id)));
      setBankQuestions(available);
    } catch (err) {
      console.error('Failed to fetch bank questions:', err);
    } finally {
      setLoadingBankQuestions(false);
    }
  };

  const openManageQuestionsModal = (test: any) => {
    setActiveTestForQuestions(test);
    setQuestionTab('linked');
    setSelectedBankQuestionIds(new Set());
    setBankSearch('');
    setIsManageQuestionsOpen(true);
    fetchTestQuestions(test.id);
  };

  useEffect(() => {
    if (isManageQuestionsOpen && questionTab === 'bank' && activeTestForQuestions) {
      fetchBankQuestions();
    }
  }, [isManageQuestionsOpen, questionTab, bankSearch]);

  const toggleSelectBankQuestion = (qId: number) => {
    const updated = new Set(selectedBankQuestionIds);
    if (updated.has(qId)) {
      updated.delete(qId);
    } else {
      updated.add(qId);
    }
    setSelectedBankQuestionIds(updated);
  };

  const toggleSelectAllBank = () => {
    if (selectedBankQuestionIds.size === bankQuestions.length) {
      setSelectedBankQuestionIds(new Set());
    } else {
      setSelectedBankQuestionIds(new Set(bankQuestions.map((q) => Number(q.id))));
    }
  };

  const handleAddSelectedFromBank = async () => {
    if (selectedBankQuestionIds.size === 0 || !activeTestForQuestions) return;
    setAddingFromBank(true);
    try {
      const ids = Array.from(selectedBankQuestionIds);
      await Promise.all(
        ids.map((id) =>
          adminService.updateQuestion(String(id), { test_id: activeTestForQuestions.id })
        )
      );

      await fetchTestQuestions(activeTestForQuestions.id);
      setSelectedBankQuestionIds(new Set());
      setQuestionTab('linked');
      alert(`Successfully added ${ids.length} question(s) to this test!`);
    } catch (err) {
      console.error('Failed to add questions from bank:', err);
      alert('Failed to add some questions to the test');
    } finally {
      setAddingFromBank(false);
    }
  };

  const handleUnlinkQuestion = async (questionId: string | number) => {
    if (
      !confirm(
        'Unlink this question from this test? The question will remain safely in the general Question Bank.'
      )
    ) {
      return;
    }
    try {
      await adminService.updateQuestion(String(questionId), { test_id: null });
      if (activeTestForQuestions) {
        await fetchTestQuestions(activeTestForQuestions.id);
      }
    } catch (err) {
      console.error('Failed to unlink question:', err);
      alert('Failed to unlink question');
    }
  };

  const handleCreateNewQuestionForTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionForm.question_text.trim()) {
      return alert('Question text is required');
    }
    if (!activeTestForQuestions) return;

    setCreatingQuestion(true);
    try {
      const subjectName = getSubjectName(activeTestForQuestions.subject_id);
      const payload = {
        ...newQuestionForm,
        test_id: activeTestForQuestions.id,
        subject: subjectName,
      };
      await adminService.createQuestion(payload);

      setNewQuestionForm({
        question_text: '',
        question_type: 'MCQ',
        marks: 1,
        negative_marks: 0,
        difficulty: 'Medium',
        explanation: '',
        topic: '',
        options: [
          { option_text: '', option_key: 'A', is_correct: true, display_order: 1 },
          { option_text: '', option_key: 'B', is_correct: false, display_order: 2 },
          { option_text: '', option_key: 'C', is_correct: false, display_order: 3 },
          { option_text: '', option_key: 'D', is_correct: false, display_order: 4 },
        ],
      });

      await fetchTestQuestions(activeTestForQuestions.id);
      setQuestionTab('linked');
      alert('New question created and attached to this test successfully!');
    } catch (err) {
      console.error('Failed to create question for test:', err);
      alert('Failed to create question');
    } finally {
      setCreatingQuestion(false);
    }
  };

  const setCorrectOptionInNewForm = (index: number) => {
    const updated = newQuestionForm.options.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    }));
    setNewQuestionForm({ ...newQuestionForm, options: updated });
  };

  const setCorrectOptionInQuickForm = (index: number) => {
    const updated = quickQuestionForm.options.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    }));
    setQuickQuestionForm({ ...quickQuestionForm, options: updated });
  };

  return (
    <div className="flex flex-col h-full space-y-6 relative">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam/Test Management</h1>
          <p className="text-sm text-gray-500">Create tests, manage questions, and duplicate exams.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
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
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No tests found.
                  </td>
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
                          <p className="text-xs text-gray-500">
                            {getSubjectName(test.subject_id)} &bull; Passing: {test.passing_marks || 0}/
                            {test.total_marks || 0}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" /> {test.duration_minutes || test.duration || 60} mins
                      </div>
                    </td>
                    <td className="py-3 px-5 text-sm font-medium text-gray-900">
                      <button
                        onClick={() => openManageQuestionsModal(test)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                        title="Click to manage questions"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{test.total_questions || test.questions_count || 0} Questions</span>
                      </button>
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
                        <button
                          onClick={() => openManageQuestionsModal(test)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                          title="Add / Manage Questions"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Questions</span>
                        </button>
                        <button
                          onClick={() => handleDuplicate(test.id)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Duplicate Test"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openViewModal(test)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(test)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
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

      {/* --- CREATE / EDIT TEST MODAL WITH DIRECT QUESTION ATTACHMENT --- */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isEditOpen ? 'Edit Test' : 'Create New Test'}
                </h3>
                <p className="text-xs text-gray-500">
                  Configure test settings and add questions directly.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditOpen ? handleEdit : handleCreate} className="space-y-5 flex-1">
              {/* Test Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Test Title / Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Physics Mock Test 1"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.subject_id}
                  onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  {subjects.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Numbers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Duration (m)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={form.total_marks}
                    onChange={(e) => setForm({ ...form, total_marks: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Pass Marks</label>
                  <input
                    type="number"
                    min="0"
                    value={form.passing_marks}
                    onChange={(e) => setForm({ ...form, passing_marks: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Total Questions</label>
                  <input
                    type="number"
                    readOnly
                    value={stagedQuestions.length}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-gray-100 text-indigo-700 font-bold cursor-not-allowed"
                    title="Automatically matches questions added below"
                  />
                </div>
              </div>

              {/* DIRECT QUESTIONS SECTION */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-600" />
                      <span>Questions in this Test ({stagedQuestions.length})</span>
                    </label>
                    <p className="text-2xs text-gray-500">
                      Add questions now so this test is complete and ready to take upon creation.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBankIdsToAdd(new Set());
                        setBankSearchTerm('');
                        setIsPickFromBankOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Pick from Bank</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsQuickCreateQuestionOpen(true)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ New Question</span>
                    </button>
                  </div>
                </div>

                {stagedQuestions.length > 0 ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-56 overflow-y-auto bg-gray-50">
                    {stagedQuestions.map((q, idx) => (
                      <div
                        key={q.id || `draft-${idx}`}
                        className="p-3 bg-white flex items-start justify-between gap-3 hover:bg-gray-50/80 transition-colors"
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              {q.is_new_draft && (
                                <span className="px-1.5 py-0.2 rounded text-2xs font-bold bg-amber-100 text-amber-800">
                                  New Draft
                                </span>
                              )}
                              <span
                                className={`px-1.5 py-0.2 rounded text-2xs font-semibold uppercase ${
                                  q.difficulty === 'Hard' || q.difficulty === 'hard'
                                    ? 'bg-rose-100 text-rose-700'
                                    : q.difficulty === 'Medium' || q.difficulty === 'medium'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {q.difficulty || 'Medium'}
                              </span>
                              <span className="text-2xs text-gray-500 font-medium">
                                Marks: {q.marks || 1}
                              </span>
                              <span className="text-2xs text-gray-500 font-medium">
                                Neg: -{q.negative_marks || 0}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {q.question_text || q.question || q.text}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...stagedQuestions];
                            updated.splice(idx, 1);
                            setStagedQuestions(updated);
                          }}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Remove from test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50/50">
                    <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-gray-700 mb-0.5">
                      No questions attached yet
                    </p>
                    <p className="text-2xs text-gray-500">
                      Use <strong>&quot;Pick from Bank&quot;</strong> or{' '}
                      <strong>&quot;+ New Question&quot;</strong> above to add questions now, or you can add them later.
                    </p>
                  </div>
                )}
              </div>

              {/* Publish option */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Publish Immediately (Make available to students)</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setIsEditOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {isEditOpen
                      ? 'Save Changes'
                      : stagedQuestions.length > 0
                      ? `Create Test with ${stagedQuestions.length} Question(s)`
                      : 'Create Test'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SUB-MODAL 1: PICK FROM BANK DURING CREATE / EDIT TEST --- */}
      {isPickFromBankOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-5 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                <h4 className="text-base font-bold text-gray-900">Pick from Question Bank</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsPickFromBankOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions by text or topic..."
                value={bankSearchTerm}
                onChange={(e) => setBankSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 bg-gray-50/50">
              {loadingBankForPicker ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Loading questions from bank...</p>
                </div>
              ) : availableBankQuestions.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  No available questions found matching your search.
                </div>
              ) : (
                availableBankQuestions.map((q) => {
                  const isChecked = selectedBankIdsToAdd.has(Number(q.id));
                  return (
                    <label
                      key={q.id}
                      className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                        isChecked ? 'bg-indigo-50/60' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const updated = new Set(selectedBankIdsToAdd);
                          if (updated.has(Number(q.id))) {
                            updated.delete(Number(q.id));
                          } else {
                            updated.add(Number(q.id));
                          }
                          setSelectedBankIdsToAdd(updated);
                        }}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-2xs font-mono text-gray-400">#{q.id}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-2xs font-semibold uppercase ${
                              q.difficulty === 'Hard' || q.difficulty === 'hard'
                                ? 'bg-rose-100 text-rose-700'
                                : q.difficulty === 'Medium' || q.difficulty === 'medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {q.difficulty || 'Medium'}
                          </span>
                          {q.subject && (
                            <span className="text-2xs bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded">
                              {q.subject}
                            </span>
                          )}
                          <span className="text-2xs text-gray-500 ml-auto font-medium">
                            Marks: {q.marks || 1}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-gray-900 line-clamp-2">
                          {q.question_text || q.question || q.text}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-gray-100 mt-3">
              <span className="text-xs text-gray-500">
                {selectedBankIdsToAdd.size} question(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPickFromBankOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSelectedFromPicker}
                  disabled={selectedBankIdsToAdd.size === 0}
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 shadow-xs"
                >
                  Add Selected ({selectedBankIdsToAdd.size})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUB-MODAL 2: QUICK CREATE QUESTION DURING CREATE / EDIT TEST --- */}
      {isQuickCreateQuestionOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h4 className="text-base font-bold text-gray-900">Add New Question</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickCreateQuestionOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddQuickDraftQuestion} className="space-y-3.5">
              <div>
                <label className="block text-2xs font-bold text-gray-700 mb-1">
                  Question Text <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Enter question text..."
                  value={quickQuestionForm.question_text}
                  onChange={(e) =>
                    setQuickQuestionForm({ ...quickQuestionForm, question_text: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none bg-white"
                />
              </div>

              {/* Options */}
              <div className="space-y-1.5">
                <label className="block text-2xs font-bold text-gray-700">
                  Options (Radio marks the correct option)
                </label>
                <div className="space-y-1.5">
                  {quickQuestionForm.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs bg-white ${
                        opt.is_correct ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="quick_create_opt"
                        checked={opt.is_correct}
                        onChange={() => setCorrectOptionInQuickForm(idx)}
                        className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 shrink-0"
                      />
                      <span className="font-bold text-gray-700 text-xs">{opt.option_key}.</span>
                      <input
                        type="text"
                        required
                        placeholder={`Option ${opt.option_key}...`}
                        value={opt.option_text}
                        onChange={(e) => {
                          const opts = [...quickQuestionForm.options];
                          opts[idx].option_text = e.target.value;
                          setQuickQuestionForm({ ...quickQuestionForm, options: opts });
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Marks & Difficulty */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Marks</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={quickQuestionForm.marks}
                    onChange={(e) =>
                      setQuickQuestionForm({
                        ...quickQuestionForm,
                        marks: Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Negative</label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={quickQuestionForm.negative_marks}
                    onChange={(e) =>
                      setQuickQuestionForm({
                        ...quickQuestionForm,
                        negative_marks: Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={quickQuestionForm.difficulty}
                    onChange={(e) =>
                      setQuickQuestionForm({ ...quickQuestionForm, difficulty: e.target.value })
                    }
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-gray-700 mb-1">Explanation (Optional)</label>
                <input
                  type="text"
                  placeholder="Optional brief explanation..."
                  value={quickQuestionForm.explanation}
                  onChange={(e) =>
                    setQuickQuestionForm({ ...quickQuestionForm, explanation: e.target.value })
                  }
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateQuestionOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                >
                  Attach to this Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- STANDALONE MANAGE QUESTIONS MODAL (FROM TABLE ACTION) --- */}
      {isManageQuestionsOpen && activeTestForQuestions && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-gray-50 to-indigo-50/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {activeTestForQuestions.title || activeTestForQuestions.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700">
                      #{activeTestForQuestions.id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <span>
                      Subject: <strong>{getSubjectName(activeTestForQuestions.subject_id)}</strong>
                    </span>
                    <span>&bull;</span>
                    <span>
                      Duration:{' '}
                      <strong>
                        {activeTestForQuestions.duration_minutes ||
                          activeTestForQuestions.duration ||
                          60}
                        m
                      </strong>
                    </span>
                    <span>&bull;</span>
                    <span>
                      Total Marks: <strong>{activeTestForQuestions.total_marks || 100}</strong>
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsManageQuestionsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-header Navigation Tabs */}
            <div className="flex border-b border-gray-200 bg-white px-6 gap-6">
              <button
                onClick={() => setQuestionTab('linked')}
                className={`py-3.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  questionTab === 'linked'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Linked Questions</span>
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 font-bold">
                  {testQuestions.length}
                </span>
              </button>

              <button
                onClick={() => setQuestionTab('bank')}
                className={`py-3.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  questionTab === 'bank'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Pick from Question Bank</span>
              </button>

              <button
                onClick={() => setQuestionTab('create')}
                className={`py-3.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  questionTab === 'create'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Create New Question</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50">
              {/* TAB 1: LINKED QUESTIONS */}
              {questionTab === 'linked' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">
                        Questions in this Test ({testQuestions.length})
                      </h4>
                      <p className="text-xs text-gray-500">
                        These questions will be presented to students when attempting this test.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuestionTab('bank')}
                        className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-indigo-600 rounded-lg shadow-xs flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" /> Pick from Bank
                      </button>
                      <button
                        onClick={() => setQuestionTab('create')}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create New
                      </button>
                    </div>
                  </div>

                  {loadingTestQuestions ? (
                    <div className="py-16 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Loading questions for this test...</p>
                    </div>
                  ) : testQuestions.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                      <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h5 className="font-bold text-gray-800 mb-1">No questions added yet</h5>
                      <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
                        This test doesn&apos;t have any questions linked yet. You can pick existing
                        questions from your Question Bank or create new questions specifically for
                        this test.
                      </p>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => setQuestionTab('bank')}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                        >
                          Pick from Question Bank
                        </button>
                        <button
                          onClick={() => setQuestionTab('create')}
                          className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold"
                        >
                          Create New Question
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {testQuestions.map((q, idx) => {
                        const isExpanded = expandedQuestionId === q.id;
                        return (
                          <div
                            key={q.id || idx}
                            className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs hover:border-gray-300 transition-all"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <span className="text-xs font-mono font-semibold text-gray-400">
                                      #{q.id}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded text-2xs font-semibold uppercase ${
                                        q.difficulty === 'Hard' || q.difficulty === 'hard'
                                          ? 'bg-rose-100 text-rose-700'
                                          : q.difficulty === 'Medium' || q.difficulty === 'medium'
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-emerald-100 text-emerald-700'
                                      }`}
                                    >
                                      {q.difficulty || 'Medium'}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">
                                      Marks: <strong className="text-gray-800">{q.marks || 1}</strong>
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">
                                      Neg:{' '}
                                      <strong className="text-rose-600">
                                        -{q.negative_marks || 0}
                                      </strong>
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                    {q.question_text || q.question || q.text}
                                  </p>

                                  {/* Expandable options view */}
                                  {isExpanded && q.options && q.options.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {q.options.map((opt: any, optIdx: number) => (
                                        <div
                                          key={opt.id || optIdx}
                                          className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                                            opt.is_correct
                                              ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-semibold'
                                              : 'border-gray-200 bg-gray-50 text-gray-700'
                                          }`}
                                        >
                                          <span className="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-2xs">
                                            {opt.option_key || String.fromCharCode(65 + optIdx)}
                                          </span>
                                          <span className="flex-1">{opt.option_text}</span>
                                          {opt.is_correct && (
                                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                          )}
                                        </div>
                                      ))}
                                      {q.explanation && (
                                        <div className="col-span-full mt-1 p-2 bg-indigo-50/50 rounded-lg text-xs text-indigo-900">
                                          <strong>Explanation:</strong> {q.explanation}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {q.options && q.options.length > 0 && (
                                  <button
                                    onClick={() =>
                                      setExpandedQuestionId(isExpanded ? null : q.id)
                                    }
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs flex items-center gap-1 font-medium transition-colors"
                                    title={isExpanded ? 'Hide options' : 'View options'}
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUnlinkQuestion(q.id)}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Unlink from this test"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PICK FROM QUESTION BANK */}
              {questionTab === 'bank' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search question bank by text or topic..."
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleSelectAllBank}
                        className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg"
                      >
                        {selectedBankQuestionIds.size === bankQuestions.length &&
                        bankQuestions.length > 0
                          ? 'Deselect All'
                          : 'Select All'}
                      </button>

                      <button
                        onClick={handleAddSelectedFromBank}
                        disabled={selectedBankQuestionIds.size === 0 || addingFromBank}
                        className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        {addingFromBank ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>Add Selected ({selectedBankQuestionIds.size}) to Test</span>
                      </button>
                    </div>
                  </div>

                  {loadingBankQuestions ? (
                    <div className="py-16 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Searching Question Bank...</p>
                    </div>
                  ) : bankQuestions.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-xs">
                      No available questions found in the Question Bank matching your search.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {bankQuestions.map((q) => {
                        const isSelected = selectedBankQuestionIds.has(Number(q.id));
                        return (
                          <div
                            key={q.id}
                            onClick={() => toggleSelectBankQuestion(Number(q.id))}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? 'bg-indigo-50/60 border-indigo-500 ring-1 ring-indigo-500'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectBankQuestion(Number(q.id))}
                              className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono font-semibold text-gray-400">
                                  #{q.id}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-2xs font-semibold uppercase ${
                                    q.difficulty === 'Hard' || q.difficulty === 'hard'
                                      ? 'bg-rose-100 text-rose-700'
                                      : q.difficulty === 'Medium' || q.difficulty === 'medium'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {q.difficulty || 'Medium'}
                                </span>
                                {q.subject && (
                                  <span className="text-2xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    {q.subject}
                                  </span>
                                )}
                                {q.topic && (
                                  <span className="text-2xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    {q.topic}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-medium text-gray-900 line-clamp-2">
                                {q.question_text || q.question || q.text}
                              </p>
                            </div>
                            <div className="text-right text-xs text-gray-500 shrink-0">
                              <span>Marks: {q.marks || 1}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CREATE NEW QUESTION FOR THIS TEST */}
              {questionTab === 'create' && (
                <form onSubmit={handleCreateNewQuestionForTest} className="space-y-4">
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                    <p className="text-xs text-indigo-900 leading-relaxed">
                      This question will be saved into the master Question Bank and automatically
                      attached to <strong>{activeTestForQuestions.title || activeTestForQuestions.name}</strong>.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Question Text <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newQuestionForm.question_text}
                      onChange={(e) =>
                        setNewQuestionForm({ ...newQuestionForm, question_text: e.target.value })
                      }
                      placeholder="Type your question prompt here..."
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-white"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">
                      Options (Select the correct option with the radio button)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {newQuestionForm.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs bg-white ${
                            opt.is_correct ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="new_test_correct_opt"
                            checked={opt.is_correct}
                            onChange={() => setCorrectOptionInNewForm(idx)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 shrink-0"
                          />
                          <span className="font-bold text-gray-700">{opt.option_key}.</span>
                          <input
                            type="text"
                            required
                            placeholder={`Option ${opt.option_key} text...`}
                            value={opt.option_text}
                            onChange={(e) => {
                              const opts = [...newQuestionForm.options];
                              opts[idx].option_text = e.target.value;
                              setNewQuestionForm({ ...newQuestionForm, options: opts });
                            }}
                            className="flex-1 px-2.5 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Marks & Difficulty */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-2xs font-bold text-gray-700 mb-1">Marks</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={newQuestionForm.marks}
                        onChange={(e) =>
                          setNewQuestionForm({ ...newQuestionForm, marks: Number(e.target.value) })
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-bold text-gray-700 mb-1">Negative Marks</label>
                      <input
                        type="number"
                        min="0"
                        step="0.25"
                        value={newQuestionForm.negative_marks}
                        onChange={(e) =>
                          setNewQuestionForm({
                            ...newQuestionForm,
                            negative_marks: Number(e.target.value),
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-bold text-gray-700 mb-1">Difficulty</label>
                      <select
                        value={newQuestionForm.difficulty}
                        onChange={(e) =>
                          setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-2xs font-bold text-gray-700 mb-1">Topic</label>
                      <input
                        type="text"
                        placeholder="Optional topic tag..."
                        value={newQuestionForm.topic}
                        onChange={(e) =>
                          setNewQuestionForm({ ...newQuestionForm, topic: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-gray-700 mb-1">Explanation (Optional)</label>
                    <textarea
                      rows={2}
                      value={newQuestionForm.explanation}
                      onChange={(e) =>
                        setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })
                      }
                      placeholder="Explain why the selected option is correct..."
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none bg-white"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setQuestionTab('linked')}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingQuestion}
                      className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {creatingQuestion && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Save & Link to Test</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {testQuestions.length} question(s) attached to this test
              </span>
              <button
                type="button"
                onClick={() => setIsManageQuestionsOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PREVIEW MODAL --- */}
      {isViewOpen && viewData && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">Test Preview</h3>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
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
                  <p className="text-sm text-gray-500">
                    ID: #{viewData.id} &bull; {getSubjectName(viewData.subject_id)}
                  </p>
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
                  <p className="text-sm font-medium text-gray-900">
                    {viewData.passing_marks || 0} / {viewData.total_marks || 0}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Questions</p>
                  <p className="text-sm font-medium text-gray-900">
                    {viewData.total_questions || viewData.questions_count || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between mt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsViewOpen(false);
                  openManageQuestionsModal(viewData);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition-colors shadow-xs"
              >
                Manage Questions
              </button>
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors text-xs"
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

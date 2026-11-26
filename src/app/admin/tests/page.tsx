'use client';
import { useEffect, useState } from 'react';
import { adminService } from '../../../services/adminService';
import {
  Loader2,
  Search,
  Plus,
  Edit,
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
  Tag,
  BookOpen,
  Filter,
  CheckCircle2,
  Zap,
  Globe,
  Lock,
} from 'lucide-react';

export default function TestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hierarchy caching: topics by subjectId, subtopics by topicId
  const [subjectTopicsMap, setSubjectTopicsMap] = useState<Record<string, any[]>>({});
  const [topicSubtopicsMap, setTopicSubtopicsMap] = useState<Record<string, any[]>>({});
  const [examSubjectsMap, setExamSubjectsMap] = useState<Record<string, any[]>>({});
  const [loadingExamSubjects, setLoadingExamSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingSubtopics, setLoadingSubtopics] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('ALL');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [togglingPublishId, setTogglingPublishId] = useState<string | null>(null);

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
  const [quickQuestionForm, setQuickQuestionForm] = useState<{
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
    question_text: '',
    question_type: 'MCQ',
    marks: 1,
    negative_marks: 0,
    difficulty: 'Medium',
    explanation: '',
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
  const [questionTab, setQuestionTab] = useState<'linked' | 'auto_populate' | 'bank' | 'create'>('linked');

  // Auto-populate tab state in Manage Questions modal
  const [autoPopulateCount, setAutoPopulateCount] = useState<number>(10);
  const [autoPopulateTopicId, setAutoPopulateTopicId] = useState<string>('');
  const [autoPopulateDifficulty, setAutoPopulateDifficulty] = useState<string>('Medium');
  const [autoPopulating, setAutoPopulating] = useState(false);

  // Dedicated modal bank questions state
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [loadingBankQuestions, setLoadingBankQuestions] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [selectedBankQuestionIds, setSelectedBankQuestionIds] = useState<Set<number>>(new Set());
  const [addingFromBank, setAddingFromBank] = useState(false);

  // Dedicated modal new question form (Step 6 Option 3)
  const [newQuestionForm, setNewQuestionForm] = useState<{
    question_text: string;
    question_type: string;
    marks: number | '';
    negative_marks: number | '';
    difficulty: string;
    explanation: string;
    topic_id: string;
    subtopic_id: string;
    options: {
      option_text: string;
      option_key: string;
      is_correct: boolean;
      display_order: number;
    }[];
  }>({
    question_text: '',
    question_type: 'MCQ',
    marks: 1,
    negative_marks: 0,
    difficulty: 'Medium',
    explanation: '',
    topic_id: '',
    subtopic_id: '',
    options: [
      { option_text: '', option_key: 'A', is_correct: true, display_order: 1 },
      { option_text: '', option_key: 'B', is_correct: false, display_order: 2 },
      { option_text: '', option_key: 'C', is_correct: false, display_order: 3 },
      { option_text: '', option_key: 'D', is_correct: false, display_order: 4 },
    ],
  });
  const [creatingQuestion, setCreatingQuestion] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  // Main Test Form (Matching Steps 1, 5, 7 Payloads)
  const [form, setForm] = useState<{
    name: string;
    description: string;
    exam_id: string;
    subject_id: string;
    test_type: 'topic_wise' | 'full_length' | 'multi_topic';
    topic_id: string;
    subtopic_id: string;
    topic_ids: number[];
    duration_minutes: number | '';
    total_marks: number | '';
    passing_marks: number | '';
    negative_marking: number | '';
    difficulty: string;
    is_free: boolean;
    is_published: boolean;
    questions_count: number;
  }>({
    name: '',
    description: '',
    exam_id: '',
    subject_id: '',
    test_type: 'topic_wise',
    topic_id: '',
    subtopic_id: '',
    topic_ids: [],
    duration_minutes: 20,
    total_marks: 20,
    passing_marks: 8,
    negative_marking: 0.5,
    difficulty: 'Medium',
    is_free: true,
    is_published: false,
    questions_count: 0,
  });

  const getSubjectName = (subjectId: string | number) => {
    if (!subjectId) return 'Unassigned';
    const sub = subjects.find((s) => String(s.id) === String(subjectId));
    return sub ? sub.name : `Subject #${subjectId}`;
  };

  const getExamName = (examId: string | number | undefined | null) => {
    if (!examId) return null;
    const exam = exams.find((e) => String(e.id) === String(examId));
    return exam ? exam.name : `Exam #${examId}`;
  };

  const getTopicName = (subjectId: string | number, topicId: string | number) => {
    if (!topicId) return null;
    const list = subjectTopicsMap[String(subjectId)] || [];
    const t = list.find((item) => String(item.id) === String(topicId));
    return t ? t.name : `Topic #${topicId}`;
  };

  const getSubtopicName = (topicId: string | number, subtopicId: string | number) => {
    if (!subtopicId) return null;
    const list = topicSubtopicsMap[String(topicId)] || [];
    const st = list.find((item) => String(item.id) === String(subtopicId));
    return st ? st.name : `Subtopic #${subtopicId}`;
  };

  const fetchTests = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedExamFilter !== 'ALL' && selectedExamFilter !== 'UNASSIGNED') {
        params.exam_id = selectedExamFilter;
      }
      if (selectedSubjectFilter !== 'ALL') {
        params.subject_id = selectedSubjectFilter;
      }
      if (selectedTopicFilter !== 'ALL') {
        params.topic_id = selectedTopicFilter;
      }
      if (selectedTypeFilter !== 'ALL') {
        params.test_type = selectedTypeFilter;
      }

      const res = await adminService.getTests(params);
      const data = res.tests || res.data?.tests || res.data || res;
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

  const fetchExams = async () => {
    try {
      const res = await adminService.getExams();
      const data = res.exams || res.data?.exams || res.data || res;
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
    }
  };

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

  const handleExamChange = async (examId: string) => {
    setForm((prev) => ({ ...prev, exam_id: examId, subject_id: '', topic_id: '', subtopic_id: '' }));
    if (!examId) return;
    if (examSubjectsMap[examId]) return;

    setLoadingExamSubjects(true);
    try {
      const res = await adminService.getExamSubjects(examId);
      const data = res?.subjects || res?.data?.subjects || res?.data || res;
      setExamSubjectsMap((prev) => ({
        ...prev,
        [examId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      console.error('Failed to load exam subjects:', err);
    } finally {
      setLoadingExamSubjects(false);
    }
  };

  const handleSubjectChange = async (subjectId: string) => {
    setForm((prev) => ({
      ...prev,
      subject_id: subjectId,
      topic_id: '',
      subtopic_id: '',
      topic_ids: [],
    }));
    if (subjectId) {
      await loadTopicsForSubject(subjectId);
    }
  };

  const handleTopicChange = async (topicId: string) => {
    setForm((prev) => ({ ...prev, topic_id: topicId, subtopic_id: '' }));
    if (topicId) {
      await loadSubtopicsForTopic(topicId);
    }
  };

  const availableSubjectsForModal =
    form.exam_id && examSubjectsMap[form.exam_id]?.length
      ? examSubjectsMap[form.exam_id]
      : subjects;

  const currentAvailableTopics = form.subject_id ? subjectTopicsMap[form.subject_id] || [] : [];
  const currentAvailableSubtopics = form.topic_id ? topicSubtopicsMap[form.topic_id] || [] : [];

  // Table filtering
  const filteredTests = tests.filter((test) => {
    // Exam filter
    if (selectedExamFilter !== 'ALL') {
      if (selectedExamFilter === 'UNASSIGNED') {
        if (test.exam_id) return false;
      } else if (String(test.exam_id || '') !== String(selectedExamFilter)) {
        return false;
      }
    }
    // Subject filter
    if (selectedSubjectFilter !== 'ALL' && String(test.subject_id || '') !== String(selectedSubjectFilter)) {
      return false;
    }
    // Topic filter
    if (selectedTopicFilter !== 'ALL') {
      const matchesSingle = String(test.topic_id || '') === String(selectedTopicFilter);
      const matchesMulti =
        Array.isArray(test.topic_ids) && test.topic_ids.map(String).includes(String(selectedTopicFilter));
      if (!matchesSingle && !matchesMulti) return false;
    }
    // Test Type filter
    if (selectedTypeFilter !== 'ALL') {
      const type = (test.test_type || (test.topic_id ? 'topic_wise' : 'full_length')).toLowerCase();
      if (type !== selectedTypeFilter.toLowerCase()) return false;
    }
    // Status filter
    if (selectedStatusFilter !== 'ALL') {
      const isPub = !!test.is_published || String(test.status || '').toLowerCase() === 'published';
      if (selectedStatusFilter === 'published' && !isPub) return false;
      if (selectedStatusFilter === 'draft' && isPub) return false;
    }
    return true;
  });

  useEffect(() => {
    fetchTests();
    fetchSubjects();
    fetchExams();
  }, [searchTerm, selectedExamFilter, selectedSubjectFilter, selectedTopicFilter, selectedTypeFilter]);

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
          const params: any = { search: bankSearchTerm };
          if (form.subject_id) params.subject_id = form.subject_id;
          if (form.topic_id) params.topic_id = form.topic_id;
          const res = await adminService.getQuestions(params);
          const data = res?.questions || res?.data?.questions || res?.data || res;
          const all: any[] = Array.isArray(data) ? data : [];
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
  }, [isPickFromBankOpen, bankSearchTerm, stagedQuestions, form.subject_id, form.topic_id]);

  // Fast One-Click Toggle Publish (Step 7)
  const handleTogglePublish = async (test: any) => {
    const newPublishStatus = !test.is_published;
    setTogglingPublishId(String(test.id));
    try {
      await adminService.publishTest(test.id, newPublishStatus);
      setTests((prev) =>
        prev.map((t) =>
          String(t.id) === String(test.id) ? { ...t, is_published: newPublishStatus } : t
        )
      );
    } catch (err: any) {
      console.error('Publish toggle failed:', err);
      alert(err.response?.data?.error || 'Failed to update test publish status');
    } finally {
      setTogglingPublishId(null);
    }
  };

  // Step 5: Create Topic-Wise / Full-Length Test
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.subject_id) return alert('Test Name and Subject are required');
    if (form.test_type === 'topic_wise' && !form.topic_id) {
      return alert('Please select a Topic for topic-wise test');
    }

    setSubmitting(true);
    try {
      const payload: any = {
        name: form.name,
        title: form.name,
        description: form.description,
        exam_id: form.exam_id ? parseInt(form.exam_id, 10) : null,
        subject_id: parseInt(form.subject_id, 10),
        test_type: form.test_type,
        duration_minutes: form.duration_minutes === '' ? 20 : Number(form.duration_minutes),
        duration: form.duration_minutes === '' ? 20 : Number(form.duration_minutes),
        total_marks: form.total_marks === '' ? 20 : Number(form.total_marks),
        passing_marks: form.passing_marks === '' ? 8 : Number(form.passing_marks),
        negative_marking: form.negative_marking === '' ? 0.5 : Number(form.negative_marking),
        difficulty: form.difficulty || 'Medium',
        is_free: !!form.is_free,
        is_published: !!form.is_published,
        total_questions: stagedQuestions.length > 0 ? stagedQuestions.length : form.questions_count,
      };

      if (form.test_type === 'topic_wise') {
        payload.topic_id = parseInt(form.topic_id, 10);
        if (form.subtopic_id) {
          payload.subtopic_id = parseInt(form.subtopic_id, 10);
        }
      } else if (form.test_type === 'multi_topic') {
        payload.topic_ids = form.topic_ids.map(Number);
      }

      const res: any = await adminService.createTest(payload);
      const newTestId = res?.testId || res?.data?.testId || res?.id || res?.data?.id;

      // Attach staged questions if any
      if (newTestId && stagedQuestions.length > 0) {
        const existingIds = stagedQuestions.filter((q) => !q.is_new_draft && q.id).map((q) => Number(q.id));
        if (existingIds.length > 0) {
          try {
            await adminService.assignQuestionsToTest(newTestId, existingIds);
          } catch (assignErr) {
            // Fallback: update individually
            for (const id of existingIds) {
              await adminService.updateQuestion(String(id), { test_id: newTestId });
            }
          }
        }

        // Draft questions created on the fly
        const draftQuestions = stagedQuestions.filter((q) => q.is_new_draft);
        for (const q of draftQuestions) {
          await adminService.createQuestion({
            ...q,
            test_id: newTestId,
            subject_id: form.subject_id ? parseInt(form.subject_id, 10) : undefined,
            topic_id: form.topic_id ? parseInt(form.topic_id, 10) : undefined,
            subtopic_id: form.subtopic_id ? parseInt(form.subtopic_id, 10) : undefined,
          });
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
    } catch (err: any) {
      console.error('Create test failed:', err);
      alert(err.response?.data?.error || 'Failed to create Test');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Test
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !selectedTestId || !form.subject_id) {
      return alert('Name and Subject are required');
    }
    setSubmitting(true);
    try {
      const payload: any = {
        name: form.name,
        title: form.name,
        description: form.description,
        exam_id: form.exam_id ? parseInt(form.exam_id, 10) : null,
        subject_id: parseInt(form.subject_id, 10),
        test_type: form.test_type,
        duration_minutes: form.duration_minutes === '' ? 20 : Number(form.duration_minutes),
        duration: form.duration_minutes === '' ? 20 : Number(form.duration_minutes),
        total_marks: form.total_marks === '' ? 20 : Number(form.total_marks),
        passing_marks: form.passing_marks === '' ? 8 : Number(form.passing_marks),
        negative_marking: form.negative_marking === '' ? 0.5 : Number(form.negative_marking),
        difficulty: form.difficulty || 'Medium',
        is_free: !!form.is_free,
        is_published: !!form.is_published,
        total_questions: stagedQuestions.length,
      };

      if (form.test_type === 'topic_wise') {
        payload.topic_id = form.topic_id ? parseInt(form.topic_id, 10) : null;
        payload.subtopic_id = form.subtopic_id ? parseInt(form.subtopic_id, 10) : null;
      } else if (form.test_type === 'multi_topic') {
        payload.topic_ids = form.topic_ids.map(Number);
      }

      await adminService.updateTest(selectedTestId, payload);

      // Handle questions diffing
      const currentIds = new Set(
        stagedQuestions.filter((q) => !q.is_new_draft && q.id).map((q) => Number(q.id))
      );

      // Unlink removed questions
      for (const origId of originalStagedQuestionIds) {
        if (!currentIds.has(origId)) {
          await adminService.updateQuestion(String(origId), { test_id: null });
        }
      }

      // Link newly added bank questions
      const newlyAddedIds = Array.from(currentIds).filter((id) => !originalStagedQuestionIds.has(id));
      if (newlyAddedIds.length > 0) {
        try {
          await adminService.assignQuestionsToTest(selectedTestId, newlyAddedIds);
        } catch (e) {
          for (const id of newlyAddedIds) {
            await adminService.updateQuestion(String(id), { test_id: selectedTestId });
          }
        }
      }

      // Create new draft questions
      for (const q of stagedQuestions) {
        if (q.is_new_draft) {
          await adminService.createQuestion({
            ...q,
            test_id: selectedTestId,
            subject_id: form.subject_id ? parseInt(form.subject_id, 10) : undefined,
            topic_id: form.topic_id ? parseInt(form.topic_id, 10) : undefined,
            subtopic_id: form.subtopic_id ? parseInt(form.subtopic_id, 10) : undefined,
          });
        }
      }

      alert('Test updated successfully!');
      setIsEditOpen(false);
      resetForm();
      fetchTests();
    } catch (err: any) {
      console.error('Update test failed:', err);
      alert(err.response?.data?.error || 'Failed to update Test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
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

  const openEditModal = async (item: any) => {
    setSelectedTestId(String(item.id));
    const itemExamId = item.exam_id ? String(item.exam_id) : '';
    const itemSubjectId = item.subject_id ? String(item.subject_id) : '';
    const itemTopicId = item.topic_id ? String(item.topic_id) : '';
    const itemSubtopicId = item.subtopic_id ? String(item.subtopic_id) : '';

    setForm({
      name: item.name || item.title || '',
      description: item.description || '',
      exam_id: itemExamId,
      subject_id: itemSubjectId,
      test_type: item.test_type || (itemTopicId ? 'topic_wise' : 'full_length'),
      topic_id: itemTopicId,
      subtopic_id: itemSubtopicId,
      topic_ids: Array.isArray(item.topic_ids) ? item.topic_ids.map(Number) : [],
      duration_minutes: item.duration_minutes ?? item.duration ?? 20,
      total_marks: item.total_marks ?? 20,
      passing_marks: item.passing_marks ?? 8,
      negative_marking: item.negative_marking ?? item.negative_marks ?? 0.5,
      difficulty: item.difficulty || 'Medium',
      is_free: item.is_free !== undefined ? !!item.is_free : true,
      is_published: !!item.is_published,
      questions_count: item.total_questions || item.questions_count || 0,
    });

    if (itemExamId && !examSubjectsMap[itemExamId]) {
      handleExamChange(itemExamId);
    }
    if (itemSubjectId) {
      loadTopicsForSubject(itemSubjectId);
    }
    if (itemTopicId) {
      loadSubtopicsForTopic(itemTopicId);
    }

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
      name: '',
      description: '',
      exam_id: '',
      subject_id: '',
      test_type: 'topic_wise',
      topic_id: '',
      subtopic_id: '',
      topic_ids: [],
      duration_minutes: 20,
      total_marks: 20,
      passing_marks: 8,
      negative_marking: 0.5,
      difficulty: 'Medium',
      is_free: true,
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
      marks: quickQuestionForm.marks === '' ? 1 : Number(quickQuestionForm.marks),
      negative_marks: quickQuestionForm.negative_marks === '' ? 0 : Number(quickQuestionForm.negative_marks),
      is_new_draft: true,
      id: `draft-${Date.now()}`,
    };
    setStagedQuestions((prev) => [...prev, newQuestion]);
    setIsQuickCreateQuestionOpen(false);
    setQuickQuestionForm({
      question_text: '',
      question_type: 'MCQ',
      marks: 1,
      negative_marks: 0,
      difficulty: 'Medium',
      explanation: '',
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
      const params: any = { search: bankSearch };
      if (activeTestForQuestions?.subject_id) {
        params.subject_id = activeTestForQuestions.subject_id;
      }
      if (activeTestForQuestions?.topic_id) {
        params.topic_id = activeTestForQuestions.topic_id;
      }
      const res = await adminService.getQuestions(params);
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
    setAutoPopulateTopicId(test.topic_id ? String(test.topic_id) : '');
    setAutoPopulateDifficulty(test.difficulty || 'Medium');
    setAutoPopulateCount(10);
    setNewQuestionForm({
      question_text: '',
      question_type: 'MCQ',
      marks: 2,
      negative_marks: test.negative_marking || 0.5,
      difficulty: test.difficulty || 'Medium',
      explanation: '',
      topic_id: test.topic_id ? String(test.topic_id) : '',
      subtopic_id: test.subtopic_id ? String(test.subtopic_id) : '',
      options: [
        { option_text: '', option_key: 'A', is_correct: true, display_order: 1 },
        { option_text: '', option_key: 'B', is_correct: false, display_order: 2 },
        { option_text: '', option_key: 'C', is_correct: false, display_order: 3 },
        { option_text: '', option_key: 'D', is_correct: false, display_order: 4 },
      ],
    });

    if (test.subject_id) {
      loadTopicsForSubject(test.subject_id);
    }
    if (test.topic_id) {
      loadSubtopicsForTopic(test.topic_id);
    }

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

  // Step 6 Option 1: Assign existing questions from Question Bank
  const handleAddSelectedFromBank = async () => {
    if (selectedBankQuestionIds.size === 0 || !activeTestForQuestions) return;
    setAddingFromBank(true);
    try {
      const ids = Array.from(selectedBankQuestionIds);
      try {
        await adminService.assignQuestionsToTest(activeTestForQuestions.id, ids);
      } catch (e) {
        // Fallback
        await Promise.all(
          ids.map((id) =>
            adminService.updateQuestion(String(id), { test_id: activeTestForQuestions.id })
          )
        );
      }

      await fetchTestQuestions(activeTestForQuestions.id);
      setSelectedBankQuestionIds(new Set());
      setQuestionTab('linked');
      alert(`Successfully assigned ${ids.length} question(s) to this test!`);
    } catch (err) {
      console.error('Failed to add questions from bank:', err);
      alert('Failed to add some questions to the test');
    } finally {
      setAddingFromBank(false);
    }
  };

  // Step 6 Option 2: Auto-Populate from Question Bank by Topic
  const handleAutoPopulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTestForQuestions) return;
    const targetTopicId = autoPopulateTopicId || activeTestForQuestions.topic_id;
    if (!targetTopicId) {
      return alert('Please select a topic to auto-populate from');
    }

    setAutoPopulating(true);
    try {
      await adminService.autoPopulateTestQuestions(activeTestForQuestions.id, {
        count: autoPopulateCount,
        topic_id: targetTopicId,
        difficulty: autoPopulateDifficulty,
      });

      await fetchTestQuestions(activeTestForQuestions.id);
      setQuestionTab('linked');
      alert(
        `Successfully auto-populated ${autoPopulateCount} questions for this test from the Question Bank!`
      );
    } catch (err: any) {
      console.error('Auto-populate failed:', err);
      alert(err.response?.data?.error || 'Failed to auto-populate questions from Question Bank');
    } finally {
      setAutoPopulating(false);
    }
  };

  // Step 6 Option 3: Create New Question with Topic Tagging
  const handleCreateNewQuestionForTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionForm.question_text.trim()) {
      return alert('Question text is required');
    }
    if (!activeTestForQuestions) return;

    setCreatingQuestion(true);
    try {
      const subjectName = getSubjectName(activeTestForQuestions.subject_id);
      const payload: any = {
        test_id: activeTestForQuestions.id,
        subject_id: activeTestForQuestions.subject_id ? parseInt(activeTestForQuestions.subject_id, 10) : undefined,
        subject: subjectName,
        question_text: newQuestionForm.question_text,
        question_type: newQuestionForm.question_type,
        marks: newQuestionForm.marks === '' ? 2 : Number(newQuestionForm.marks),
        negative_marks:
          newQuestionForm.negative_marks === '' ? 0.5 : Number(newQuestionForm.negative_marks),
        difficulty: newQuestionForm.difficulty,
        explanation: newQuestionForm.explanation,
        options: newQuestionForm.options,
      };

      if (newQuestionForm.topic_id) {
        payload.topic_id = parseInt(newQuestionForm.topic_id, 10);
      } else if (activeTestForQuestions.topic_id) {
        payload.topic_id = parseInt(activeTestForQuestions.topic_id, 10);
      }

      if (newQuestionForm.subtopic_id) {
        payload.subtopic_id = parseInt(newQuestionForm.subtopic_id, 10);
      } else if (activeTestForQuestions.subtopic_id) {
        payload.subtopic_id = parseInt(activeTestForQuestions.subtopic_id, 10);
      }

      await adminService.createQuestion(payload);

      setNewQuestionForm({
        question_text: '',
        question_type: 'MCQ',
        marks: 2,
        negative_marks: activeTestForQuestions.negative_marking || 0.5,
        difficulty: 'Medium',
        explanation: '',
        topic_id: activeTestForQuestions.topic_id ? String(activeTestForQuestions.topic_id) : '',
        subtopic_id: activeTestForQuestions.subtopic_id ? String(activeTestForQuestions.subtopic_id) : '',
        options: [
          { option_text: '', option_key: 'A', is_correct: true, display_order: 1 },
          { option_text: '', option_key: 'B', is_correct: false, display_order: 2 },
          { option_text: '', option_key: 'C', is_correct: false, display_order: 3 },
          { option_text: '', option_key: 'D', is_correct: false, display_order: 4 },
        ],
      });

      await fetchTestQuestions(activeTestForQuestions.id);
      setQuestionTab('linked');
      alert('New question created with topic tagging and attached successfully!');
    } catch (err: any) {
      console.error('Failed to create question for test:', err);
      alert(err.response?.data?.error || 'Failed to create question');
    } finally {
      setCreatingQuestion(false);
    }
  };

  const handleUnlinkQuestion = async (questionId: string | number) => {
    if (!confirm('Unlink this question from this test? It will remain safely in the Question Bank.')) {
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
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Topic-Wise & Exam Tests</h1>
          <p className="text-sm text-gray-500">
            Create topic-wise practice tests, auto-populate questions from Question Bank, and publish tests.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Test
        </button>
      </header>

      {/* FILTER CONTROLS BAR */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px] max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tests by title or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Test Type Filter */}
            <div className="flex items-center gap-1.5">
              {/* <span className="text-2xs font-semibold text-gray-500">Type:</span> */}
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">All Types</option>
                <option value="topic_wise">🎯 Topic-Wise</option>
                <option value="multi_topic">📚 Multi-Topic</option>
                <option value="full_length">🏆 Full-Length</option>
              </select>
            </div>

            {/* Exam Filter */}
            <div className="flex items-center gap-1.5">
              {/* <span className="text-2xs font-semibold text-gray-500">Exam:</span> */}
              <select
                value={selectedExamFilter}
                onChange={(e) => {
                  setSelectedExamFilter(e.target.value);
                  setSelectedTopicFilter('ALL');
                }}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">All Exams</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
                <option value="UNASSIGNED">Unassigned</option>
              </select>
            </div>

            {/* Subject Filter */}
            <div className="flex items-center gap-1.5">
              {/* <span className="text-2xs font-semibold text-gray-500">Subject:</span> */}
              <select
                value={selectedSubjectFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedSubjectFilter(val);
                  setSelectedTopicFilter('ALL');
                  if (val !== 'ALL') {
                    loadTopicsForSubject(val);
                  }
                }}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Filter (When Subject is selected) */}
            {selectedSubjectFilter !== 'ALL' && subjectTopicsMap[selectedSubjectFilter]?.length > 0 && (
              <div className="flex items-center gap-1.5 animate-in fade-in">
                <span className="text-2xs font-semibold text-gray-500">Topic:</span>
                <select
                  value={selectedTopicFilter}
                  onChange={(e) => setSelectedTopicFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-indigo-50/60 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">All Topics</option>
                  {subjectTopicsMap[selectedSubjectFilter].map((top) => (
                    <option key={top.id} value={top.id}>
                      {top.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              {/* <span className="text-2xs font-semibold text-gray-500">Status:</span> */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {(selectedExamFilter !== 'ALL' ||
              selectedSubjectFilter !== 'ALL' ||
              selectedTopicFilter !== 'ALL' ||
              selectedTypeFilter !== 'ALL' ||
              selectedStatusFilter !== 'ALL' ||
              searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedExamFilter('ALL');
                  setSelectedSubjectFilter('ALL');
                  setSelectedTopicFilter('ALL');
                  setSelectedTypeFilter('ALL');
                  setSelectedStatusFilter('ALL');
                  setSearchTerm('');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded hover:bg-indigo-50 cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* TESTS TABLE */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Test Details</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hierarchy & Type</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Config</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Questions</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Publish Status</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 text-xs">
                    No tests found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => {
                  const isTopicWise = test.test_type === 'topic_wise' || !!test.topic_id;
                  const isMultiTopic = test.test_type === 'multi_topic';
                  const isPublished =
                    !!test.is_published || String(test.status || '').toLowerCase() === 'published';
                  const isToggling = togglingPublishId === String(test.id);

                  return (
                    <tr key={test.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-5 text-xs font-mono text-gray-500">#{test.id}</td>

                      {/* Test Title & Description */}
                      <td className="py-3 px-5">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isTopicWise
                                ? 'bg-indigo-50 text-indigo-600'
                                : isMultiTopic
                                ? 'bg-purple-50 text-purple-600'
                                : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-semibold text-gray-900 text-sm">{test.name || test.title}</p>
                              {test.is_free ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                                  FREE
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                                  PREMIUM
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                                  test.difficulty === 'Hard' || test.difficulty === 'hard'
                                    ? 'bg-rose-100 text-rose-700'
                                    : test.difficulty === 'Easy' || test.difficulty === 'easy'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {test.difficulty || 'Medium'}
                              </span>
                            </div>
                            {/* {test.description && (
                              <p className="text-2xs text-gray-500 line-clamp-1 mt-0.5">{test.description}</p>
                            )} */}
                          </div>
                        </div>
                      </td>

                      {/* Hierarchy Tagging & Type */}
                      <td className="py-3 px-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isTopicWise ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                                <Tag className="w-2.5 h-2.5 text-indigo-600" /> Topic-Wise
                              </span>
                            ) : isMultiTopic ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                <Layers className="w-2.5 h-2.5 text-purple-600" /> Multi-Topic
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                Full-Length
                              </span>
                            )}
                            {test.exam_id && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700">
                                {getExamName(test.exam_id)}
                              </span>
                            )}
                          </div>

                          {/* <div className="text-2xs text-gray-600 font-medium flex items-center gap-1 flex-wrap">
                            <span className="text-gray-900 font-semibold">{getSubjectName(test.subject_id)}</span>
                            {test.topic_id && (
                              <>
                                <span className="text-gray-400">&rarr;</span>
                                <span className="text-indigo-700 font-semibold">
                                  {test.topic?.name || getTopicName(test.subject_id, test.topic_id)}
                                </span>
                              </>
                            )}
                            {test.subtopic_id && (
                              <>
                                <span className="text-gray-400">&bull;</span>
                                <span className="text-emerald-700 font-medium">
                                  {test.subtopic?.name || getSubtopicName(test.topic_id, test.subtopic_id)}
                                </span>
                              </>
                            )}
                          </div> */}
                        </div>
                      </td>

                      {/* Config */}
                      <td className="py-3 px-5">
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <div className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{test.duration_minutes || test.duration || 20}m</span>
                            <span>&bull;</span>
                            <span>{test.total_marks || 20} Marks</span>
                          </div>
                          <div className="text-2xs text-gray-500">
                            Pass: {test.passing_marks || 8} | Neg: -{test.negative_marking ?? test.negative_marks ?? 0.5}
                          </div>
                        </div>
                      </td>

                      {/* Questions count */}
                      <td className="py-3 px-5">
                        <button
                          onClick={() => openManageQuestionsModal(test)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors shadow-2xs"
                          title="Manage Questions or Auto-Populate by Topic"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{test.total_questions || test.questions_count || 0} Questions</span>
                        </button>
                      </td>

                      {/* Step 7: Fast One-Click Publish / Unpublish */}
                      <td className="py-3 px-5">
                        <button
                          onClick={() => handleTogglePublish(test)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shadow-2xs ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                          }`}
                          title={isPublished ? 'Click to unpublish' : 'Click to publish instantly'}
                        >
                          {isToggling ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
                          ) : isPublished ? (
                            <Globe className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          <span>{isPublished ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              openManageQuestionsModal(test);
                              setQuestionTab('auto_populate');
                            }}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Auto-Populate Questions from Bank"
                          >
                            <Zap className="w-4 h-4 text-amber-500" />
                          </button>
                          <button
                            onClick={() => openViewModal(test)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Test"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(test)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Test"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(test.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Test"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- CREATE / EDIT TEST 2-PART MODAL --- */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-7xl w-full h-[90vh] flex flex-col overflow-hidden">
          {/* Top Sticky Header */}
          <div className="px-6 py-3.5 border-b border-gray-200 bg-white flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900 truncate">
                    {isEditOpen ? 'Edit Test' : 'Create Topic-Wise / Full-Length Test'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                    {form.test_type === 'topic_wise'
                      ? 'Topic-Wise'
                      : form.test_type === 'multi_topic'
                      ? 'Multi-Topic'
                      : 'Full-Length'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate">
                  Configure test settings on the left and manage attached questions on the right.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="test-editor-form"
                disabled={submitting}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isEditOpen ? 'Save Changes' : 'Create Test'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg ml-1"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2-Column Split Body */}
          <form
            id="test-editor-form"
            onSubmit={isEditOpen ? handleEdit : handleCreate}
            className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
          >
            {/* PART 1 (LEFT): TEST CONFIGURATION */}
            <div className="lg:col-span-6 overflow-y-auto p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">
              {/* Test Type Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Test Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, test_type: 'topic_wise' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      form.test_type === 'topic_wise'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 ring-1 ring-indigo-600'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Topic-Wise</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, test_type: 'multi_topic' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      form.test_type === 'multi_topic'
                        ? 'border-purple-600 bg-purple-50/70 text-purple-700 ring-1 ring-purple-600'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Multi-Topic Chapter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, test_type: 'full_length' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      form.test_type === 'full_length'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-700 ring-1 ring-blue-600'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Full-Length Mock</span>
                  </button>
                </div>
              </div>

              {/* Test Name & Description */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Test Name / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SSC CGL Mathematics: Percentage Practice Test 01"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Topic-wise practice test for Percentage"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Hierarchy Cascade: Exam -> Subject -> Topic -> Subtopic */}
              <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                  Hierarchy Targeting
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Target Exam */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Target Exam</label>
                    <select
                      value={form.exam_id}
                      onChange={(e) => handleExamChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="">Select an Exam (or General)</option>
                      {exams.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.subject_id}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="">Select a Subject</option>
                      {availableSubjectsForModal.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Topic & Subtopic Row for Topic-Wise Test */}
                {form.test_type === 'topic_wise' && form.subject_id && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200/60 animate-in fade-in">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          Topic <span className="text-red-500">*</span>
                        </label>
                        {loadingTopics && (
                          <span className="text-[10px] text-indigo-600 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Loading topics...
                          </span>
                        )}
                      </div>
                      <select
                        required
                        value={form.topic_id}
                        onChange={(e) => handleTopicChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                      >
                        <option value="">Select a Topic</option>
                        {currentAvailableTopics.map((top) => (
                          <option key={top.id} value={top.id}>
                            {top.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          Subtopic (Optional)
                        </label>
                        {loadingSubtopics && (
                          <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Loading subtopics...
                          </span>
                        )}
                      </div>
                      <select
                        value={form.subtopic_id}
                        onChange={(e) => setForm({ ...form, subtopic_id: e.target.value })}
                        disabled={!form.topic_id || currentAvailableSubtopics.length === 0}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100"
                      >
                        <option value="">
                          {!form.topic_id
                            ? 'First select a topic'
                            : currentAvailableSubtopics.length === 0
                            ? 'No subtopics available'
                            : 'Select a Subtopic'}
                        </option>
                        {currentAvailableSubtopics.map((subtop) => (
                          <option key={subtop.id} value={subtop.id}>
                            {subtop.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Multi-Topic Chapter Test Topic Badges */}
                {form.test_type === 'multi_topic' && form.subject_id && (
                  <div className="pt-2 border-t border-gray-200/60 animate-in fade-in">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Select Topics for this Chapter Test:
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2.5 bg-white rounded-lg border border-gray-200">
                      {currentAvailableTopics.length === 0 ? (
                        <span className="text-[11px] text-gray-400 italic">No topics found for this subject</span>
                      ) : (
                        currentAvailableTopics.map((top) => {
                          const isSelected = form.topic_ids.includes(Number(top.id));
                          return (
                            <button
                              type="button"
                              key={top.id}
                              onClick={() => {
                                const idNum = Number(top.id);
                                if (isSelected) {
                                  setForm({
                                    ...form,
                                    topic_ids: form.topic_ids.filter((id) => id !== idNum),
                                  });
                                } else {
                                  setForm({
                                    ...form,
                                    topic_ids: [...form.topic_ids, idNum],
                                  });
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300 font-bold'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                              }`}
                            >
                              <Tag className="w-3 h-3 text-purple-600" />
                              <span>{top.name}</span>
                              {isSelected && <Check className="w-3 h-3 text-purple-700" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Numbers Grid: Duration, Marks, Pass, Negative, Difficulty */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Duration (m)</label>
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
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Total Marks</label>
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
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Pass Marks</label>
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
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Negative Mark</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={form.negative_marking}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        negative_marking: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white font-medium"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Free & Publish Checkboxes */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_free}
                    onChange={(e) => setForm({ ...form, is_free: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Mark as Free Practice Test</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Publish Immediately</span>
                </label>
              </div>
            </div>

            {/* PART 2 (RIGHT): QUESTIONS ATTACHED TO THIS TEST */}
            <div className="lg:col-span-6 flex flex-col min-h-0 bg-slate-50/70 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
                <div>
                  <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    <span>Questions attached to this Test</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-700">
                      {stagedQuestions.length}
                    </span>
                  </label>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Add questions from the Question Bank or draft new questions for this test.
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
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Pick from Bank</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsQuickCreateQuestionOpen(true)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Question</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                {stagedQuestions.length > 0 ? (
                  <div className="space-y-2.5">
                    {stagedQuestions.map((q, idx) => (
                      <div
                        key={q.id || `draft-${idx}`}
                        className="p-3.5 bg-white border border-gray-200 rounded-xl flex items-start justify-between gap-3 hover:border-indigo-300 transition-colors shadow-2xs"
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              {q.is_new_draft && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                                  Draft
                                </span>
                              )}
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                                  q.difficulty === 'Hard' || q.difficulty === 'hard'
                                    ? 'bg-rose-100 text-rose-700'
                                    : q.difficulty === 'Easy' || q.difficulty === 'easy'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {q.difficulty || 'Medium'}
                              </span>
                              <span className="text-[10px] text-gray-500 font-medium">
                                Marks: {q.marks || 1}
                              </span>
                              <span className="text-[10px] text-gray-500 font-medium">
                                Neg: -{q.negative_marks || 0}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-gray-900 leading-relaxed">
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
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                          title="Remove from test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full min-h-[260px] border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-white/70">
                    <div className="w-11 h-11 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-gray-800 mb-1">No questions attached yet</p>
                    <p className="text-[11px] text-gray-500 max-w-xs mb-4">
                      Use &ldquo;Pick from Bank&rdquo; or &ldquo;New Question&rdquo; above to attach questions directly to this test.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBankIdsToAdd(new Set());
                          setBankSearchTerm('');
                          setIsPickFromBankOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" /> Pick from Bank
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsQuickCreateQuestionOpen(true)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> New Question
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* --- SUB-MODAL: PICK FROM BANK DURING CREATE / EDIT --- */}
      {isPickFromBankOpen && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h4 className="text-base font-bold text-gray-900">Select Questions from Question Bank</h4>
              <button
                onClick={() => setIsPickFromBankOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-3 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions by text or topic..."
                value={bankSearchTerm}
                onChange={(e) => setBankSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingBankForPicker ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Searching Question Bank...</p>
                </div>
              ) : availableBankQuestions.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-8">
                  No questions found in Question Bank matching criteria.
                </p>
              ) : (
                availableBankQuestions.map((q) => {
                  const isChecked = selectedBankIdsToAdd.has(Number(q.id));
                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        const updated = new Set(selectedBankIdsToAdd);
                        if (isChecked) updated.delete(Number(q.id));
                        else updated.add(Number(q.id));
                        setSelectedBankIdsToAdd(updated);
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-3 transition-colors ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-50/60'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-gray-400 text-3xs">#{q.id}</span>
                          <span className="px-1.5 py-0.2 rounded text-3xs font-semibold uppercase bg-gray-100 text-gray-700">
                            {q.difficulty || 'Medium'}
                          </span>
                          {q.topic && (
                            <span className="text-3xs text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                              {q.topic}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-900 line-clamp-2">
                          {q.question_text || q.question || q.text}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">{selectedBankIdsToAdd.size} selected</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPickFromBankOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSelectedFromPicker}
                  disabled={selectedBankIdsToAdd.size === 0}
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
                >
                  Add Selected ({selectedBankIdsToAdd.size})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUB-MODAL: QUICK CREATE QUESTION DURING CREATE / EDIT --- */}
      {isQuickCreateQuestionOpen && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h4 className="text-base font-bold text-gray-900">Add New Question Draft</h4>
              <button
                onClick={() => setIsQuickCreateQuestionOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuickDraftQuestion} className="space-y-3 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter question text here..."
                  value={quickQuestionForm.question_text}
                  onChange={(e) =>
                    setQuickQuestionForm({ ...quickQuestionForm, question_text: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={quickQuestionForm.marks}
                    onChange={(e) =>
                      setQuickQuestionForm({
                        ...quickQuestionForm,
                        marks: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Negative</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={quickQuestionForm.negative_marks}
                    onChange={(e) =>
                      setQuickQuestionForm({
                        ...quickQuestionForm,
                        negative_marks: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={quickQuestionForm.difficulty}
                    onChange={(e) =>
                      setQuickQuestionForm({ ...quickQuestionForm, difficulty: e.target.value })
                    }
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-gray-700">Options (Select Correct)</label>
                {quickQuestionForm.options.map((opt, idx) => (
                  <div key={opt.option_key} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="quick_correct"
                      checked={opt.is_correct}
                      onChange={() => setCorrectOptionInQuickForm(idx)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="w-5 text-xs font-bold text-gray-600">{opt.option_key}.</span>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${opt.option_key} text`}
                      value={opt.option_text}
                      onChange={(e) => {
                        const updated = [...quickQuestionForm.options];
                        updated[idx].option_text = e.target.value;
                        setQuickQuestionForm({ ...quickQuestionForm, options: updated });
                      }}
                      className="flex-1 px-2.5 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Explanation</label>
                <input
                  type="text"
                  placeholder="Optional answer explanation"
                  value={quickQuestionForm.explanation}
                  onChange={(e) =>
                    setQuickQuestionForm({ ...quickQuestionForm, explanation: e.target.value })
                  }
                  className="w-full px-2.5 py-1 text-xs border border-gray-300 rounded"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateQuestionOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                >
                  Add Draft Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DEDICATED MANAGE QUESTIONS MODAL (STEP 6) --- */}
      {isManageQuestionsOpen && activeTestForQuestions && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">
                    {activeTestForQuestions.name || activeTestForQuestions.title}
                  </h3>
                  <span className="text-xs font-mono text-gray-400">#{activeTestForQuestions.id}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span>{getSubjectName(activeTestForQuestions.subject_id)}</span>
                  {activeTestForQuestions.topic_id && (
                    <>
                      <span>&rarr;</span>
                      <span className="font-semibold text-indigo-700">
                        {activeTestForQuestions.topic?.name ||
                          getTopicName(activeTestForQuestions.subject_id, activeTestForQuestions.topic_id)}
                      </span>
                    </>
                  )}
                  <span>&bull;</span>
                  <span>{testQuestions.length} Questions</span>
                </div>
              </div>
              <button
                onClick={() => setIsManageQuestionsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs (4 Options from Step 6) */}
            <div className="flex border-b border-gray-200 bg-white px-6 gap-6 overflow-x-auto">
              <button
                onClick={() => setQuestionTab('linked')}
                className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                  questionTab === 'linked'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Linked Questions</span>
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 font-bold text-3xs">
                  {testQuestions.length}
                </span>
              </button>

              <button
                onClick={() => setQuestionTab('auto_populate')}
                className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                  questionTab === 'auto_populate'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Auto-Populate by Topic</span>
              </button>

              <button
                onClick={() => setQuestionTab('bank')}
                className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                  questionTab === 'bank'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Pick from Bank</span>
              </button>

              <button
                onClick={() => setQuestionTab('create')}
                className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
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
            <div className="p-5 flex-1 overflow-y-auto bg-gray-50/50">
              {/* TAB 1: LINKED QUESTIONS */}
              {questionTab === 'linked' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">
                        Questions in this Test ({testQuestions.length})
                      </h4>
                      <p className="text-[12px] text-gray-500">
                        These questions are presented to students taking this test.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setQuestionTab('auto_populate')}
                        className="px-2 py-0.5 text-[12px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 text-amber-600" /> Auto-Populate
                      </button>
                      <button
                        onClick={() => setQuestionTab('bank')}
                        className="px-2 py-0.5 text-[12px] font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-indigo-600 rounded-lg flex items-center gap-1 shadow-2xs"
                      >
                        <Search className="w-3 h-3" /> Pick Bank
                      </button>
                      <button
                        onClick={() => setQuestionTab('create')}
                        className="px-2 py-0.5 text-[12px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3 h-3" /> Create New
                      </button>
                    </div>
                  </div>

                  {loadingTestQuestions ? (
                    <div className="py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Loading test questions...</p>
                    </div>
                  ) : testQuestions.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
                      <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <h5 className="font-bold text-gray-800 text-sm mb-1">No questions added yet</h5>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                        Use Auto-Populate to instantly grab questions from this topic, or pick existing questions from the bank.
                      </p>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setQuestionTab('auto_populate')}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5" /> Auto-Populate from Topic
                        </button>
                        <button
                          onClick={() => setQuestionTab('bank')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                        >
                          Pick from Question Bank
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {testQuestions.map((q, idx) => {
                        const isExpanded = expandedQuestionId === q.id;
                        return (
                          <div
                            key={q.id || idx}
                            className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs hover:border-gray-300 transition-all text-xs"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-2xs">
                                  {idx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                    <span className="font-mono text-gray-400 text-3xs">#{q.id}</span>
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-3xs font-semibold uppercase ${
                                        q.difficulty === 'Hard' || q.difficulty === 'hard'
                                          ? 'bg-rose-100 text-rose-700'
                                          : 'bg-emerald-100 text-emerald-700'
                                      }`}
                                    >
                                      {q.difficulty || 'Medium'}
                                    </span>
                                    <span className="text-3xs text-gray-500 font-medium">Marks: {q.marks || 1}</span>
                                    <span className="text-3xs text-gray-500 font-medium">Neg: -{q.negative_marks || 0}</span>
                                  </div>
                                  <p className="font-medium text-gray-900">
                                    {q.question_text || q.question || q.text}
                                  </p>

                                  {/* Expanded Options */}
                                  {isExpanded && q.options && (
                                    <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1.5">
                                      {q.options.map((opt: any) => (
                                        <div
                                          key={opt.id || opt.option_key}
                                          className={`p-1.5 rounded flex items-center gap-2 ${
                                            opt.is_correct
                                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold'
                                              : 'bg-gray-50 text-gray-700'
                                          }`}
                                        >
                                          <span className="w-4 font-bold">{opt.option_key}.</span>
                                          <span>{opt.option_text}</span>
                                          {opt.is_correct && (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />
                                          )}
                                        </div>
                                      ))}
                                      {q.explanation && (
                                        <p className="text-2xs text-gray-600 bg-amber-50 p-2 rounded mt-1">
                                          <strong>Explanation:</strong> {q.explanation}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {q.options && (
                                  <button
                                    onClick={() =>
                                      setExpandedQuestionId(isExpanded ? null : q.id)
                                    }
                                    className="p-1 text-gray-400 hover:text-indigo-600 rounded"
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
                                  className="p-1 text-gray-400 hover:text-rose-600 rounded"
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

              {/* TAB 2: AUTO-POPULATE BY TOPIC (STEP 6 OPTION 2) */}
              {questionTab === 'auto_populate' && (
                <form onSubmit={handleAutoPopulate} className="space-y-4 max-w-md mx-auto py-4">
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
                    <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 space-y-1">
                      <p className="font-bold">Auto-Populate from Question Bank</p>
                      <p className="text-2xs leading-relaxed text-amber-800">
                        Automatically selects questions tagged with the target topic and difficulty
                        from your Question Bank and links them directly to this test.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Target Topic <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={autoPopulateTopicId}
                      onChange={(e) => setAutoPopulateTopicId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      <option value="">Select a Topic</option>
                      {(subjectTopicsMap[activeTestForQuestions.subject_id] || []).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Number of Questions
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={autoPopulateCount}
                        onChange={(e) => setAutoPopulateCount(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Difficulty</label>
                      <select
                        value={autoPopulateDifficulty}
                        onChange={(e) => setAutoPopulateDifficulty(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={autoPopulating}
                      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {autoPopulating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Auto-Populating Questions...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Populate {autoPopulateCount} Questions Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: PICK FROM QUESTION BANK (STEP 6 OPTION 1) */}
              {questionTab === 'bank' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search question bank..."
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleSelectAllBank}
                        className="px-2.5 py-1 text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg"
                      >
                        {selectedBankQuestionIds.size === bankQuestions.length && bankQuestions.length > 0
                          ? 'Deselect All'
                          : 'Select All'}
                      </button>

                      <button
                        onClick={handleAddSelectedFromBank}
                        disabled={selectedBankQuestionIds.size === 0 || addingFromBank}
                        className="px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 shadow-xs flex items-center gap-1.5"
                      >
                        {addingFromBank ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>Assign Selected ({selectedBankQuestionIds.size})</span>
                      </button>
                    </div>
                  </div>

                  {loadingBankQuestions ? (
                    <div className="py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Searching Question Bank...</p>
                    </div>
                  ) : bankQuestions.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-xs">
                      No questions found in Question Bank matching your filters.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {bankQuestions.map((q) => {
                        const isSelected = selectedBankQuestionIds.has(Number(q.id));
                        return (
                          <div
                            key={q.id}
                            onClick={() => toggleSelectBankQuestion(Number(q.id))}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-xs ${
                              isSelected
                                ? 'bg-indigo-50/70 border-indigo-500 ring-1 ring-indigo-500'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectBankQuestion(Number(q.id))}
                              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-mono text-gray-400 text-3xs">#{q.id}</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-3xs font-semibold uppercase ${
                                    q.difficulty === 'Hard' || q.difficulty === 'hard'
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {q.difficulty || 'Medium'}
                                </span>
                                {q.topic && (
                                  <span className="text-3xs text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                                    {q.topic}
                                  </span>
                                )}
                              </div>
                              <p className="font-medium text-gray-900 line-clamp-2">
                                {q.question_text || q.question || q.text}
                              </p>
                            </div>
                            <span className="text-2xs text-gray-500 shrink-0">Marks: {q.marks || 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CREATE NEW QUESTION WITH TOPIC TAGGING (STEP 6 OPTION 3) */}
              {questionTab === 'create' && (
                <form onSubmit={handleCreateNewQuestionForTest} className="space-y-3 max-w-xl mx-auto py-2">
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center gap-2.5 text-xs text-indigo-900">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      This question will be saved into the master Question Bank with topic tags and linked to{' '}
                      <strong>{activeTestForQuestions.name || activeTestForQuestions.title}</strong>.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Question Text <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. If the price of sugar increases by 25%, by what percent must a family decrease consumption?"
                      value={newQuestionForm.question_text}
                      onChange={(e) =>
                        setNewQuestionForm({ ...newQuestionForm, question_text: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-2xs font-bold text-gray-700 mb-1">Type</label>
                      <select
                        value={newQuestionForm.question_type}
                        onChange={(e) =>
                          setNewQuestionForm({ ...newQuestionForm, question_type: e.target.value })
                        }
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                      >
                        <option value="MCQ">MCQ</option>
                        <option value="Numerical">Numerical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-2xs font-bold text-gray-700 mb-1">Marks</label>
                      <input
                        type="number"
                        min="1"
                        value={newQuestionForm.marks}
                        onChange={(e) =>
                          setNewQuestionForm({
                            ...newQuestionForm,
                            marks: e.target.value === '' ? '' : Number(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold text-gray-700 mb-1">Negative</label>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        value={newQuestionForm.negative_marks}
                        onChange={(e) =>
                          setNewQuestionForm({
                            ...newQuestionForm,
                            negative_marks: e.target.value === '' ? '' : Number(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold text-gray-700 mb-1">Difficulty</label>
                      <select
                        value={newQuestionForm.difficulty}
                        onChange={(e) =>
                          setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value })
                        }
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-gray-700">Options (Mark Correct)</label>
                    {newQuestionForm.options.map((opt, idx) => (
                      <div key={opt.option_key} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="create_correct"
                          checked={opt.is_correct}
                          onChange={() => setCorrectOptionInNewForm(idx)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="w-5 text-xs font-bold text-gray-600">{opt.option_key}.</span>
                        <input
                          type="text"
                          required
                          placeholder={`Option ${opt.option_key} text`}
                          value={opt.option_text}
                          onChange={(e) => {
                            const updated = [...newQuestionForm.options];
                            updated[idx].option_text = e.target.value;
                            setNewQuestionForm({ ...newQuestionForm, options: updated });
                          }}
                          className="flex-1 px-2.5 py-1 text-xs border border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Explanation</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Required reduction = [25 / (100 + 25)] * 100 = 20%."
                      value={newQuestionForm.explanation}
                      onChange={(e) =>
                        setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })
                      }
                      className="w-full px-2.5 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="submit"
                      disabled={creatingQuestion}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {creatingQuestion && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Create and Link Question</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-gray-200 bg-white flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {testQuestions.length} question(s) currently attached
              </span>
              <button
                type="button"
                onClick={() => setIsManageQuestionsOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PREVIEW / VIEW MODAL --- */}
      {isViewOpen && viewData && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Test Overview</h3>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/70 rounded-xl flex items-start gap-3 border border-indigo-100">
                <div className="w-10 h-10 rounded-lg bg-white shadow-2xs flex items-center justify-center text-indigo-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">{viewData.name || viewData.title}</h4>
                  <p className="text-xs text-gray-600 mt-0.5">{viewData.description || 'No description'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-150">
                  <span className="text-3xs uppercase tracking-wider text-gray-500 font-bold block mb-0.5">
                    Test Type
                  </span>
                  <span className="text-xs font-semibold text-indigo-700">
                    {viewData.test_type === 'topic_wise' || viewData.topic_id
                      ? 'Topic-Wise Test'
                      : viewData.test_type === 'multi_topic'
                      ? 'Multi-Topic Test'
                      : 'Full-Length Test'}
                  </span>
                </div>

                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-150">
                  <span className="text-3xs uppercase tracking-wider text-gray-500 font-bold block mb-0.5">
                    Access & Status
                  </span>
                  <span className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    {viewData.is_free ? (
                      <span className="text-emerald-700 font-bold">Free</span>
                    ) : (
                      <span className="text-amber-700 font-bold">Premium</span>
                    )}
                    <span>&bull;</span>
                    {viewData.is_published ? (
                      <span className="text-emerald-600 font-bold">Published</span>
                    ) : (
                      <span className="text-gray-500">Draft</span>
                    )}
                  </span>
                </div>

                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-150">
                  <span className="text-3xs uppercase tracking-wider text-gray-500 font-bold block mb-0.5">
                    Subject & Topic
                  </span>
                  <p className="text-xs font-medium text-gray-800">
                    {getSubjectName(viewData.subject_id)}
                    {viewData.topic_id && ` → ${viewData.topic?.name || getTopicName(viewData.subject_id, viewData.topic_id)}`}
                  </p>
                </div>

                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-150">
                  <span className="text-3xs uppercase tracking-wider text-gray-500 font-bold block mb-0.5">
                    Duration & Marks
                  </span>
                  <p className="text-xs font-medium text-gray-800">
                    {viewData.duration_minutes || viewData.duration || 20}m | Pass: {viewData.passing_marks || 0}/
                    {viewData.total_marks || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setIsViewOpen(false);
                  openManageQuestionsModal(viewData);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Manage Questions
              </button>
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200"
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

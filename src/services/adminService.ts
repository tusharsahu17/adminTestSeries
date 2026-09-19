import { getData, postData, putData, patchData, deleteData } from './apiClient';

export const adminService = {
  getDashboardOverview: async () => {
    return await getData('/api/admin/dashboard');
  },
  
  // Users
  getUsers: async (params?: any) => {
    return await getData('/api/admin/users', params);
  },
  getUserProfile: async (userId: string) => {
    return await getData(`/api/admin/users/${userId}`);
  },
  getUserAttempts: async (userId: string) => {
    return await getData(`/api/admin/users/${userId}/attempts`);
  },
  getUserActivity: async (userId: string) => {
    return await getData(`/api/admin/users/${userId}/activity`);
  },
  updateUserDetails: async (userId: string, data: any) => {
    return await patchData(`/api/admin/users/${userId}/profile`, data);
  },
  resetUserPassword: async (userId: string, newPassword: string) => {
    return await patchData(`/api/admin/users/${userId}/reset-password`, { newPassword });
  },
  updateUserStatus: async (userId: string, status: string) => {
    return await patchData(`/api/admin/users/${userId}/status`, { status });
  },
  
  // Subjects & Hierarchy
  getSubjects: async () => {
    return await getData('/api/subjects');
  },
  createSubject: async (data: any) => {
    return await postData('/api/subjects', data);
  },
  updateSubject: async (id: string, data: any) => {
    return await putData(`/api/subjects/${id}`, data);
  },
  deleteSubject: async (id: string) => {
    return await deleteData(`/api/subjects/${id}`);
  },
  
  getTopics: async (subjectId: string) => {
    return await getData(`/api/admin/hierarchy/subjects/${subjectId}/topics`);
  },
  createTopic: async (subjectId: string, data: any) => {
    return await postData(`/api/admin/hierarchy/subjects/${subjectId}/topics`, data);
  },
  updateTopic: async (id: string, data: any) => {
    return await putData(`/api/admin/hierarchy/topics/${id}`, data);
  },
  deleteTopic: async (id: string) => {
    return await deleteData(`/api/admin/hierarchy/topics/${id}`);
  },
  
  getSubtopics: async (topicId: string) => {
    return await getData(`/api/admin/hierarchy/topics/${topicId}/subtopics`);
  },

  // Exams
  getExams: async () => {
    return await getData('/api/exams');
  },
  createExam: async (data: any) => {
    return await postData('/api/exams', data);
  },
  updateExam: async (id: string, data: any) => {
    return await putData(`/api/exams/${id}`, data);
  },
  deleteExam: async (id: string) => {
    return await deleteData(`/api/exams/${id}`);
  },
  
  getExamSubjects: async (examId: string) => {
    return await getData(`/api/exams/${examId}/subjects`);
  },
  addExamSubject: async (examId: string, subjectId: string) => {
    return await postData(`/api/exams/${examId}/subjects`, { subjectId });
  },
  removeExamSubject: async (examId: string, subjectId: string) => {
    return await deleteData(`/api/exams/${examId}/subjects/${subjectId}`);
  },
  
  // Test Series
  getTestSeries: async (params?: any) => {
    return await getData('/api/admin/test-series', params);
  },
  getSeriesDetails: async (id: string) => {
    return await getData(`/api/admin/test-series/${id}`);
  },
  createTestSeries: async (data: any) => {
    return await postData('/api/admin/test-series', data);
  },
  updateTestSeries: async (id: string, data: any) => {
    return await putData(`/api/admin/test-series/${id}`, data);
  },
  deleteTestSeries: async (id: string) => {
    return await deleteData(`/api/admin/test-series/${id}`);
  },
  addTestToSeries: async (id: string, testId: string, order: number) => {
    return await postData(`/api/admin/test-series/${id}/tests`, { test_id: testId, order });
  },
  reorderTestSeriesTests: async (id: string, orderedTestIds: number[]) => {
    return await putData(`/api/admin/test-series/${id}/tests/reorder`, { ordered_test_ids: orderedTestIds });
  },
  syncSeriesTests: async (id: string, testIds: number[]) => {
    return await putData(`/api/admin/test-series/${id}/tests/sync`, { test_ids: testIds });
  },

  // Categories
  getCategories: async () => {
    return await getData('/api/admin/categories');
  },
  getCategory: async (id: string) => {
    return await getData(`/api/admin/categories/${id}`);
  },
  createCategory: async (data: any) => {
    return await postData('/api/admin/categories', data);
  },
  updateCategory: async (id: string, data: any) => {
    return await putData(`/api/admin/categories/${id}`, data);
  },
  deleteCategory: async (id: string) => {
    return await deleteData(`/api/admin/categories/${id}`);
  },
  
  // Tests
  getTests: async (params?: any) => {
    return await getData('/api/admin/tests', params);
  },
  createTest: async (data: any) => {
    return await postData('/api/admin/tests', data);
  },
  updateTest: async (id: string, data: any) => {
    return await putData(`/api/admin/tests/${id}`, data);
  },
  deleteTest: async (id: string) => {
    return await deleteData(`/api/admin/tests/${id}`);
  },
  
  // Questions
  getQuestions: async (params?: any) => {
    return await getData('/api/admin/questions', params);
  },
  getQuestion: async (id: string) => {
    return await getData(`/api/admin/questions/${id}`);
  },
  createQuestion: async (data: any) => {
    return await postData('/api/admin/questions', data);
  },
  updateQuestion: async (id: string, data: any) => {
    return await putData(`/api/admin/questions/${id}`, data);
  },
  deleteQuestion: async (id: string) => {
    return await deleteData(`/api/admin/questions/${id}`);
  },
  bulkUploadQuestions: async (formData: FormData) => {
    // We must use a direct fetch or axios call for FormData since apiClient defaults to JSON
    // Or we can just import apiClient and override headers for this one call
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/questions/bulk/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
  
  // Results
  getTestResults: async (testId: string) => {
    return await getData(`/api/admin/results/test/${testId}`);
  },
  getUserResults: async (userId: string) => {
    return await getData(`/api/admin/results/user/${userId}`);
  },
  getIndividualResult: async (attemptId: string) => {
    return await getData(`/api/admin/results/attempt/${attemptId}`);
  },
  recalculateResults: async (testId: string) => {
    return await postData(`/api/admin/results/test/${testId}/recalculate`);
  },
  
  // Leaderboards
  getLeaderboardSettings: async () => {
    return await getData('/api/admin/leaderboards/settings');
  },
  updateLeaderboardSettings: async (settings: any) => {
    return await putData('/api/admin/leaderboards/settings', settings);
  },
  getOverallLeaderboard: async () => {
    return await getData('/api/admin/leaderboards/overall');
  }
};

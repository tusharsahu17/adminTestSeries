import { getData, postData, putData, deleteData } from './apiClient';
import { analyticsService } from './admin/analyticsService';
import { enrollmentService } from './admin/enrollmentService';
import { paymentService } from './admin/paymentService';
import { subscriptionService } from './admin/subscriptionService';
import { userService } from './admin/userService';
import type {
  DashboardQueryParams,
  RevenueAnalyticsParams,
  StudentAnalyticsParams,
  TestAnalyticsParams,
  TestSeriesPerformanceParams,
} from '../types/admin/analytics';
import type { CreateEnrollmentPayload, UpdateEnrollmentStatusPayload } from '../types/admin/enrollment';
import type {
  CreatePaymentPayload,
  RefundPaymentPayload,
  UpdatePaymentStatusPayload,
} from '../types/admin/payment';
import type {
  CreateSubscriptionPayload,
  UpdateSubscriptionStatusPayload,
} from '../types/admin/subscription';
import type {
  AssignUserTestSeriesPayload,
  ExtendUserTestSeriesPayload,
  GetUsersParams,
  ResetUserPasswordPayload,
  UpdateUserProfilePayload,
  UpdateUserStatusPayload,
  UpdateUserSubscriptionPayload,
  UpdateUserTestSeriesStatusPayload,
  UserActivityQueryParams,
  UserHistoryQueryParams,
  UserPaymentQueryParams,
} from '../types/admin/user';

export const adminService = {
  // Dashboard & Analytics
  getDashboardOverview: async (params?: DashboardQueryParams) => {
    return await getData('/api/admin/dashboard', params);
  },
  getFullDashboard: (params?: DashboardQueryParams) => analyticsService.getFullDashboard(params),
  getOverviewStats: () => analyticsService.getOverview(),
  getStudentAnalytics: (params?: StudentAnalyticsParams) => analyticsService.getStudents(params),
  getTestAnalytics: (params?: TestAnalyticsParams) => analyticsService.getTests(params),
  getTestSeriesPerformance: (params?: TestSeriesPerformanceParams) =>
    analyticsService.getTestSeries(params),
  getRevenueAnalytics: (params?: RevenueAnalyticsParams) => analyticsService.getRevenue(params),
  getStudentPerformanceAnalytics: () => analyticsService.getStudentPerformance(),

  // Enrollments
  getEnrollments: (params?: Record<string, unknown>) => enrollmentService.list(params),
  createEnrollment: (data: CreateEnrollmentPayload) => enrollmentService.create(data),
  updateEnrollmentStatus: (id: string | number, data: UpdateEnrollmentStatusPayload) =>
    enrollmentService.updateStatus(id, data),

  // Payments & Subscriptions
  getPayments: (params?: Record<string, unknown>) => paymentService.list(params),
  getPaymentById: (id: string | number) => paymentService.getById(id),
  createPayment: (data: CreatePaymentPayload) => paymentService.create(data),
  updatePaymentStatus: (id: string | number, data: UpdatePaymentStatusPayload) =>
    paymentService.updateStatus(id, data),
  refundPayment: (id: string | number, data?: RefundPaymentPayload) =>
    paymentService.refund(id, data),
  getSubscriptions: (params?: Record<string, unknown>) => subscriptionService.list(params),
  createSubscription: (data: CreateSubscriptionPayload) => subscriptionService.create(data),
  updateSubscriptionStatus: (id: string | number, data: UpdateSubscriptionStatusPayload) =>
    subscriptionService.updateStatus(id, data),
  
  // Users
  getUsers: async (params?: GetUsersParams) => {
    return await getData('/api/admin/users', params);
  },
  getUsersList: (params?: GetUsersParams) => userService.list(params),
  getUserProfile: async (userId: string) => {
    return await getData(`/api/admin/users/${userId}`);
  },
  getUserOverview: (userId: string | number) => userService.getOverview(userId),
  getUserAnalytics: (userId: string | number) => userService.getAnalytics(userId),
  getUserAttempts: async (userId: string, params?: UserHistoryQueryParams) => {
    return await getData(`/api/admin/users/${userId}/attempts`, params);
  },
  getUserTestHistory: (userId: string | number, params?: UserHistoryQueryParams) =>
    userService.getTestHistory(userId, params),
  getUserAttemptDetail: (userId: string | number, attemptId: string | number) =>
    userService.getAttemptDetail(userId, attemptId),
  getUserTestSeries: (userId: string | number) => userService.getTestSeries(userId),
  assignUserTestSeries: (userId: string | number, data: AssignUserTestSeriesPayload) =>
    userService.assignTestSeries(userId, data),
  extendUserTestSeries: (
    userId: string | number,
    enrollmentId: string | number,
    data: ExtendUserTestSeriesPayload
  ) => userService.extendTestSeries(userId, enrollmentId, data),
  updateUserTestSeriesStatus: (
    userId: string | number,
    enrollmentId: string | number,
    data: UpdateUserTestSeriesStatusPayload
  ) => userService.updateTestSeriesStatus(userId, enrollmentId, data),
  getUserPayments: (userId: string | number, params?: UserPaymentQueryParams) =>
    userService.getPayments(userId, params),
  getUserPaymentDetail: (userId: string | number, paymentId: string | number) =>
    userService.getPaymentDetail(userId, paymentId),
  getUserActivity: async (userId: string) => {
    return await getData(`/api/admin/users/${userId}/activity`);
  },
  getUserActivityLogs: (userId: string | number, params?: UserActivityQueryParams) =>
    userService.getActivity(userId, params),
  exportUserReport: (userId: string | number, format: 'json' | 'csv' = 'json') =>
    userService.exportReport(userId, format),
  updateUserDetails: (userId: string | number, data: UpdateUserProfilePayload) =>
    userService.updateProfile(userId, data),
  replaceUserDetails: (userId: string | number, data: UpdateUserProfilePayload) =>
    userService.replaceUser(userId, data),
  resetUserPassword: (
    userId: string | number,
    newPasswordOrPayload: string | ResetUserPasswordPayload,
    confirmPassword?: string
  ) => {
    const payload: ResetUserPasswordPayload =
      typeof newPasswordOrPayload === 'string'
        ? {
            newPassword: newPasswordOrPayload,
            confirmPassword: confirmPassword ?? newPasswordOrPayload,
          }
        : newPasswordOrPayload;
    return userService.resetPassword(userId, payload);
  },
  updateUserStatus: (userId: string | number, statusOrPayload: string | UpdateUserStatusPayload) =>
    userService.updateStatus(userId, statusOrPayload),
  updateUserSubscription: (
    userId: string | number,
    subscriptionOrPayload: string | UpdateUserSubscriptionPayload
  ) => userService.updateSubscription(userId, subscriptionOrPayload),
  
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

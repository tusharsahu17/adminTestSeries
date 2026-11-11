export const ENDPOINTS = {
  AUTH_LOGIN: '/api/admin/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  QUIZZES: '/api/quizzes',
  EXAMS: '/api/exams',
  SUBJECTS: '/api/subjects',
  TESTS: '/api/tests',
  ATTEMPTS: '/api/attempts',

  // Admin Dashboard & Analytics
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_DASHBOARD_OVERVIEW: '/api/admin/dashboard/overview',
  ADMIN_DASHBOARD_STUDENTS: '/api/admin/dashboard/students',
  ADMIN_DASHBOARD_TESTS: '/api/admin/dashboard/tests',
  ADMIN_DASHBOARD_TEST_SERIES: '/api/admin/dashboard/test-series',
  ADMIN_DASHBOARD_REVENUE: '/api/admin/dashboard/revenue',
  ADMIN_DASHBOARD_STUDENT_PERFORMANCE: '/api/admin/dashboard/student-performance',

  // Enrollments
  ADMIN_ENROLLMENTS: '/api/admin/enrollments',
  ADMIN_ENROLLMENT_STATUS: (id: string | number) => `/api/admin/enrollments/${id}/status`,

  // Payments & Subscriptions
  ADMIN_PAYMENTS: '/api/admin/payments',
  ADMIN_PAYMENT_DETAIL: (id: string | number) => `/api/admin/payments/${id}`,
  ADMIN_PAYMENT_STATUS: (id: string | number) => `/api/admin/payments/${id}/status`,
  ADMIN_PAYMENT_REFUND: (id: string | number) => `/api/admin/payments/${id}/refund`,
  ADMIN_SUBSCRIPTIONS: '/api/admin/payments/subscriptions',
  ADMIN_SUBSCRIPTION_STATUS: (id: string | number) => `/api/admin/payments/subscriptions/${id}/status`,

  // Users Management
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER_DETAIL: (userId: string | number) => `/api/admin/users/${userId}`,
  ADMIN_USER_ANALYTICS: (userId: string | number) => `/api/admin/users/${userId}/analytics`,
  ADMIN_USER_TEST_HISTORY: (userId: string | number) => `/api/admin/users/${userId}/test-history`,
  ADMIN_USER_ATTEMPTS: (userId: string | number) => `/api/admin/users/${userId}/attempts`,
  ADMIN_USER_TEST_HISTORY_DETAIL: (userId: string | number, attemptId: string | number) =>
    `/api/admin/users/${userId}/test-history/${attemptId}`,
  ADMIN_USER_ATTEMPT_DETAIL: (userId: string | number, attemptId: string | number) =>
    `/api/admin/users/${userId}/attempts/${attemptId}`,
  ADMIN_USER_TEST_SERIES: (userId: string | number) => `/api/admin/users/${userId}/test-series`,
  ADMIN_USER_TEST_SERIES_EXTEND: (userId: string | number, enrollmentId: string | number) =>
    `/api/admin/users/${userId}/test-series/${enrollmentId}/extend`,
  ADMIN_USER_TEST_SERIES_STATUS: (userId: string | number, enrollmentId: string | number) =>
    `/api/admin/users/${userId}/test-series/${enrollmentId}/status`,
  ADMIN_USER_PAYMENTS: (userId: string | number) => `/api/admin/users/${userId}/payments`,
  ADMIN_USER_PAYMENT_DETAIL: (userId: string | number, paymentId: string | number) =>
    `/api/admin/users/${userId}/payments/${paymentId}`,
  ADMIN_USER_ACTIVITY: (userId: string | number) => `/api/admin/users/${userId}/activity`,
  ADMIN_USER_REPORT: (userId: string | number) => `/api/admin/users/${userId}/report`,
  ADMIN_USER_STATUS: (userId: string | number) => `/api/admin/users/${userId}/status`,
  ADMIN_USER_PASSWORD: (userId: string | number) => `/api/admin/users/${userId}/password`,
  ADMIN_USER_RESET_PASSWORD: (userId: string | number) => `/api/admin/users/${userId}/reset-password`,
  ADMIN_USER_PROFILE: (userId: string | number) => `/api/admin/users/${userId}/profile`,
  ADMIN_USER_SUBSCRIPTION: (userId: string | number) => `/api/admin/users/${userId}/subscription`,
};

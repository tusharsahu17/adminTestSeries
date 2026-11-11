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
};

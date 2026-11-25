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

  // PDF Endpoints
  PDFS: '/api/pdfs',
  ADMIN_PDFS: '/api/admin/pdfs',
  PDF_DETAIL: (id: string | number) => `/api/pdfs/${id}`,
  PDF_DOWNLOAD: (id: string | number) => `/api/pdfs/${id}/download`,
  PDF_VIEW: (id: string | number) => `/api/pdfs/${id}/view`,

  // PDF Categories
  PDF_CATEGORIES: '/api/pdf-categories',
  ADMIN_PDF_CATEGORIES: '/api/admin/pdf-categories',
  PDF_CATEGORY_DETAIL: (id: string | number) => `/api/pdf-categories/${id}`,
  PDF_CATEGORY_PDFS: (id: string | number) => `/api/pdf-categories/${id}/pdfs`,

  // Exams & Hierarchy
  ADMIN_EXAMS: '/api/admin/exams',
  EXAM_DETAIL: (id: string | number) => `/api/exams/${id}`,
  EXAM_SUBJECTS: (examId: string | number) => `/api/exams/${examId}/subjects`,
  EXAM_SUBJECT_DETAIL: (examId: string | number, subjectId: string | number) =>
    `/api/exams/${examId}/subjects/${subjectId}`,
  EXAM_HIERARCHY: (examId: string | number) => `/api/exams/${examId}/hierarchy`,
  EXAM_TESTS: (examId: string | number) => `/api/exams/${examId}/tests`,

  // Subjects, Topics & Subtopics Hierarchy
  ADMIN_SUBJECTS: '/api/admin/subjects',
  SUBJECT_DETAIL: (id: string | number) => `/api/subjects/${id}`,
  SUBJECT_TESTS: (subjectId: string | number) => `/api/subjects/${subjectId}/tests`,
  ADMIN_HIERARCHY_SUBJECT_TOPICS: (subjectId: string | number) =>
    `/api/admin/hierarchy/subjects/${subjectId}/topics`,
  ADMIN_HIERARCHY_TOPIC_DETAIL: (topicId: string | number) =>
    `/api/admin/hierarchy/topics/${topicId}`,
  ADMIN_HIERARCHY_TOPIC_SUBTOPICS: (topicId: string | number) =>
    `/api/admin/hierarchy/topics/${topicId}/subtopics`,
  ADMIN_HIERARCHY_SUBTOPIC_DETAIL: (subtopicId: string | number) =>
    `/api/admin/hierarchy/subtopics/${subtopicId}`,

  // Tests & Topic-Wise Tests
  ADMIN_TESTS: '/api/admin/tests',
  ADMIN_TEST_DETAIL: (id: string | number) => `/api/admin/tests/${id}`,
  ADMIN_TEST_QUESTIONS: (testId: string | number) => `/api/admin/tests/${testId}/questions`,
  ADMIN_TEST_AUTO_POPULATE: (testId: string | number) =>
    `/api/admin/tests/${testId}/questions/auto-populate`,
  ADMIN_TEST_PUBLISH: (testId: string | number) => `/api/admin/tests/${testId}/publish`,
  ADMIN_TEST_DUPLICATE: (testId: string | number) => `/api/admin/tests/${testId}/duplicate`,

  // Questions Bank
  ADMIN_QUESTIONS: '/api/admin/questions',
  ADMIN_QUESTION_DETAIL: (id: string | number) => `/api/admin/questions/${id}`,
  ADMIN_QUESTIONS_BULK_UPLOAD: '/api/admin/questions/bulk/upload',
};

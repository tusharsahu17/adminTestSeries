import type { Enrollment } from './enrollment';
import type { Payment } from './payment';

export type UserStatus = 'active' | 'inactive' | 'blocked' | string;
export type UserSubscriptionStatus = 'active' | 'inactive' | 'free' | string;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UserEngagement {
  status: string;
  label?: string;
  daysSinceLastActive: number | null;
  testsLast7Days: number;
  testsLast30Days: number;
  streakDays: number;
  loginCount: number;
  lastLoginAt: string | null;
  lastActiveAt: string | null;
}

export interface UserQuickStats {
  totalAttempts: number;
  completedAttempts: number;
  ongoingAttempts: number;
  averageScore: number;
  bestScore: number;
  averageAccuracy: number;
  passRate: number;
  totalTimeSpentSeconds: number;
  enrolledSeriesCount: number;
  activeSeriesCount: number;
  totalPaymentsCount: number;
  totalSpent: number;
  lastAttemptAt: string | null;
  rank: number | null;
}

export interface User {
  id: string | number;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: UserStatus;
  subscriptionStatus?: UserSubscriptionStatus;
  subscription_status?: string;
  isVerified?: boolean;
  avatar?: string | null;
  lastLoginAt?: string | null;
  last_login_at?: string | null;
  lastActiveAt?: string | null;
  last_active_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
  engagementStatus?: string;
  engagement?: UserEngagement;
  quickStats?: UserQuickStats;
  raw?: Record<string, unknown>;
}

export interface UsersListResponse {
  users: User[];
  pagination: PaginationMeta;
  summary?: {
    total?: number;
    active?: number;
    inactive?: number;
    blocked?: number;
    paid?: number;
  };
}

export interface UserProfileOverview {
  user: User;
  engagement: UserEngagement;
  quickStats: UserQuickStats;
  raw?: Record<string, unknown>;
}

export interface UserSubjectBreakdown {
  subjectId?: string | number;
  subjectName: string;
  attempts: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  averageScore: number;
  averageAccuracy: number;
  passRate: number;
  strengthLevel?: string;
}

export interface UserPerformanceTrendPoint {
  label: string;
  date?: string;
  testTitle?: string;
  attemptId?: string | number;
  score: number;
  totalMarks: number;
  percentage: number;
  accuracy: number;
}

export interface UserImprovementTracker {
  status: string;
  direction: 'improving' | 'declining' | 'stable' | string;
  scoreDelta: number;
  accuracyDelta: number;
  earlyAverageScore: number;
  recentAverageScore: number;
  earlyAccuracy: number;
  recentAccuracy: number;
  comparedAttemptsCount?: number;
  summaryText?: string;
}

export interface UserWeakSubject {
  subjectId?: string | number;
  subjectName: string;
  averageAccuracy: number;
  averageScore: number;
  attempts: number;
  wrongAnswers?: number;
  recommendation?: string;
}

export interface UserAnalyticsMetrics {
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageAccuracy: number;
  passRate: number;
  averageTimeSeconds: number;
  totalTimeSpentSeconds: number;
  bestPercentage: number;
  currentRank: number | null;
  bestPercentile: number | null;
}

export interface UserAnalytics {
  metrics: UserAnalyticsMetrics;
  subjectWiseBreakdown: UserSubjectBreakdown[];
  trend: UserPerformanceTrendPoint[];
  improvementTracker: UserImprovementTracker;
  weakSubjects: UserWeakSubject[];
}

export interface UserTestAttempt {
  id: string | number;
  attemptId: string | number;
  testId?: string | number;
  testTitle: string;
  testSeriesId?: string | number | null;
  testSeriesTitle?: string;
  status: string;
  score: number;
  totalMarks: number;
  percentage: number;
  accuracy: number;
  rank: number | null;
  percentile: number | null;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  startedAt?: string | null;
  submittedAt?: string | null;
  createdAt?: string | null;
  raw?: Record<string, unknown>;
}

export interface UserTestHistoryResponse {
  attempts: UserTestAttempt[];
  pagination: PaginationMeta;
}

export interface UserAttemptQuestionOption {
  key: string;
  text: string;
  isCorrect?: boolean;
}

export interface UserAttemptQuestionReview {
  id: string | number;
  order: number;
  questionText: string;
  subjectName?: string;
  topicName?: string;
  difficulty?: string;
  options: UserAttemptQuestionOption[];
  selectedOption?: string | null;
  correctOption?: string | null;
  isCorrect: boolean;
  isSkipped: boolean;
  marksAwarded: number;
  maxMarks: number;
  timeSpentSeconds?: number | null;
  explanation?: string | null;
}

export interface UserAttemptInspection {
  attempt: UserTestAttempt;
  test?: {
    id?: string | number;
    title: string;
    durationMinutes?: number;
    totalMarks?: number;
    passingMarks?: number;
    negativeMarking?: number | boolean;
  };
  testSeries?: {
    id?: string | number;
    title: string;
  } | null;
  subjectBreakdown: UserSubjectBreakdown[];
  questions: UserAttemptQuestionReview[];
  raw?: Record<string, unknown>;
}

export interface UserTestSeriesEnrollment extends Enrollment {
  testsCompleted?: number;
  totalTests?: number;
  progressPercent?: number;
  daysRemaining?: number | null;
  isExpired?: boolean;
  paymentAmount?: number | null;
}

export interface UserTestSeriesSummary {
  totalEnrolled: number;
  activeCount: number;
  expiredCount: number;
  cancelledCount: number;
  pendingCount: number;
}

export interface UserTestSeriesListResponse {
  summary: UserTestSeriesSummary;
  enrollments: UserTestSeriesEnrollment[];
}

export interface UserPaymentSummary {
  totalPaidAmount: number;
  totalPayments: number;
  successfulCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
  refundedAmount: number;
}

export interface UserPaymentListResponse {
  payments: Payment[];
  pagination: PaginationMeta;
  summary: UserPaymentSummary;
}

export interface UserActivityItem {
  id: string | number;
  type: string;
  category?: string;
  action?: string;
  description: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  testId?: string | number | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface UserLoginHistoryItem {
  id: string | number;
  ipAddress?: string | null;
  userAgent?: string | null;
  device?: string | null;
  location?: string | null;
  status?: string;
  loginAt: string;
}

export interface UserActivityResponse {
  activities: UserActivityItem[];
  loginHistory: UserLoginHistoryItem[];
  summary: {
    totalEvents: number;
    totalLogins: number;
    lastLoginAt: string | null;
    lastActiveAt: string | null;
  };
  pagination: PaginationMeta;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  subscription?: string;
  subscriptionStatus?: string;
  engagementStatus?: string;
}

export interface UserHistoryQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  search?: string;
  testSeriesId?: string | number;
}

export interface UserPaymentQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface UserActivityQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface AssignUserTestSeriesPayload {
  testSeriesId: string | number;
  accessType?: string;
  status?: string;
  expiresAt?: string;
  durationDays?: number;
  notes?: string;
}

export interface ExtendUserTestSeriesPayload {
  days?: number;
  expiresAt?: string;
  notes?: string;
}

export interface UpdateUserTestSeriesStatusPayload {
  status: string;
  notes?: string;
}

export interface UpdateUserProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  username?: string;
}

export interface ResetUserPasswordPayload {
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateUserStatusPayload {
  status: UserStatus;
  reason?: string;
}

export interface UpdateUserSubscriptionPayload {
  subscriptionStatus: UserSubscriptionStatus;
}

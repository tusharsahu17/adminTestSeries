export interface DashboardQueryParams {
  studentDays?: number;
  weeks?: number;
  studentMonths?: number;
  testDays?: number;
  revenueMonths?: number;
  seriesLimit?: number;
}

export interface StudentAnalyticsParams {
  days?: number;
  weeks?: number;
  months?: number;
}

export interface TestAnalyticsParams {
  days?: number;
}

export interface TestSeriesPerformanceParams {
  limit?: number;
  seriesLimit?: number;
}

export interface RevenueAnalyticsParams {
  months?: number;
}

export interface OverviewStats {
  totalStudents: number;
  studentsThisMonth: number;
  studentsMomGrowthPercent: number | null;
  totalTestSeries: number;
  testSeriesAddedThisMonth: number;
  totalTests: number;
  publishedTests: number;
  draftTests: number;
  scheduledTests: number;
  totalQuestions: number;
  totalTestAttempts: number;
  attemptsGrowthPercent: number | null;
  activeStudents30Days: number;
  totalRevenue: number;
  revenueGrowthPercent: number | null;
}

export interface ChartSeriesPoint {
  label: string;
  date?: string;
  count: number;
  secondaryCount?: number;
  amount?: number;
}

export interface StudentAnalytics {
  newRegistrationsToday: number;
  newRegistrationsThisWeek: number;
  newRegistrationsThisMonth: number;
  activeStudentsToday: number;
  inactiveStudents: number;
  paidStudents: number;
  freeStudents: number;
  averageTestsAttemptedPerStudent: number;
  studentRetentionRate: number;
  registrationGrowth: {
    daily: ChartSeriesPoint[];
    weekly: ChartSeriesPoint[];
    monthly: ChartSeriesPoint[];
  };
}

export interface AttemptsOverviewPoint {
  label: string;
  date?: string;
  attempts: number;
  completedAttempts: number;
  ongoingAttempts: number;
}

export interface TestAnalytics {
  totalTestsCreated: number;
  publishedTests: number;
  draftTests: number;
  scheduledTests: number;
  completedAttempts: number;
  ongoingAttempts: number;
  averageTestScore: number;
  averageTestCompletionTimeSeconds: number;
  averageTestCompletionTimeMinutes: number;
  testCompletionRate: number;
  attemptsOverview: AttemptsOverviewPoint[];
}

export interface SeriesPerformanceItem {
  id?: string | number;
  title: string;
  enrolled: number;
  attempts: number;
  completedAttempts: number;
  completionRate: number;
  totalRevenue: number;
  publishedAt?: string | null;
  isPublished?: boolean;
  price?: number;
}

export interface SeriesHighlights {
  mostPopularTestSeries: SeriesPerformanceItem | null;
  leastPopularTestSeries: SeriesPerformanceItem | null;
  highestRevenueSeries: SeriesPerformanceItem | null;
  highestCompletionRateSeries: SeriesPerformanceItem | null;
  recentlyPublishedSeries: SeriesPerformanceItem | null;
}

export interface TestSeriesPerformance {
  series: SeriesPerformanceItem[];
  highlights: SeriesHighlights;
  recentlyPublishedSeries: SeriesPerformanceItem[];
}

export interface MonthlyRevenuePoint {
  label: string;
  month?: string;
  revenue: number;
  paymentsCount?: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  revenueToday: number;
  revenueThisMonth: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  refundsCount: number;
  refundsAmount: number;
  totalPaidSubscriptions: number;
  averageOrderValue: number;
  monthlyRevenue: MonthlyRevenuePoint[];
}

export interface SubjectPerformanceItem {
  subjectId?: string | number;
  subjectName: string;
  attempts: number;
  averageScore: number;
  averageAccuracy: number;
  passPercentage: number;
}

export interface StudentPerformanceAnalytics {
  averageStudentScore: number;
  highestScore: number;
  lowestScore: number;
  averageAccuracy: number;
  averageCompletionTimeSeconds: number;
  averageCompletionTimeMinutes: number;
  passPercentage: number;
  studentsImproving: number;
  studentsStruggling: number;
  subjectWisePerformance: SubjectPerformanceItem[];
}

export interface FullDashboardData {
  overview: OverviewStats;
  studentAnalytics: StudentAnalytics;
  testAnalytics: TestAnalytics;
  testSeriesPerformance: TestSeriesPerformance;
  revenueAnalytics: RevenueAnalytics;
  studentPerformanceAnalytics: StudentPerformanceAnalytics;
}

import {
  AttemptsOverviewPoint,
  ChartSeriesPoint,
  FullDashboardData,
  MonthlyRevenuePoint,
  OverviewStats,
  RevenueAnalytics,
  SeriesPerformanceItem,
  StudentAnalytics,
  StudentPerformanceAnalytics,
  SubjectPerformanceItem,
  TestAnalytics,
  TestSeriesPerformance,
} from '../../types/admin/analytics';
import { Enrollment } from '../../types/admin/enrollment';
import { Payment } from '../../types/admin/payment';
import { Subscription } from '../../types/admin/subscription';

type AnyRecord = Record<string, unknown>;

export function asRecord(val: unknown): AnyRecord {
  return val && typeof val === 'object' && !Array.isArray(val) ? (val as AnyRecord) : {};
}

export function toNum(val: unknown, fallback = 0): number {
  if (val === null || val === undefined || val === '') return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

export function toNullableNum(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

export function toStr(val: unknown, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  return String(val);
}

export function unwrapData<T = AnyRecord>(res: unknown): T {
  const root = asRecord(res);
  if ('data' in root && root.data !== undefined && root.data !== null) {
    return root.data as T;
  }
  return res as T;
}

export function extractArray<T = AnyRecord>(res: unknown, candidateKeys: string[] = []): T[] {
  if (Array.isArray(res)) return res as T[];
  const unwrapped = unwrapData<unknown>(res);
  if (Array.isArray(unwrapped)) return unwrapped as T[];

  const rec = asRecord(unwrapped);
  for (const key of candidateKeys) {
    if (Array.isArray(rec[key])) return rec[key] as T[];
  }
  const rootRec = asRecord(res);
  for (const key of candidateKeys) {
    if (Array.isArray(rootRec[key])) return rootRec[key] as T[];
  }
  for (const val of Object.values(rec)) {
    if (Array.isArray(val)) return val as T[];
  }
  return [];
}

function pickStatNumber(field: unknown, nestedKeys: string[] = ['total', 'count', 'value', 'amount']): number {
  if (field && typeof field === 'object' && !Array.isArray(field)) {
    const rec = field as AnyRecord;
    for (const k of nestedKeys) {
      if (rec[k] !== undefined && rec[k] !== null) return toNum(rec[k]);
    }
    return 0;
  }
  return toNum(field);
}

function pickStatField(field: unknown, nestedKeys: string[]): unknown {
  if (field && typeof field === 'object' && !Array.isArray(field)) {
    const rec = field as AnyRecord;
    for (const k of nestedKeys) {
      if (rec[k] !== undefined) return rec[k];
    }
  }
  return undefined;
}

export function normalizeOverviewStats(raw: unknown): OverviewStats {
  const root = asRecord(unwrapData(raw));
  const d = asRecord(root.overview ?? root);

  const rawStudents = d.totalStudents;
  const rawSeries = d.totalTestSeries;
  const rawTests = d.totalTests;
  const rawAttempts = d.totalTestAttempts;
  const rawActive = d.activeStudents ?? d.activeStudents30Days;
  const rawRevenue = d.totalRevenue;

  return {
    totalStudents: pickStatNumber(rawStudents),
    studentsThisMonth: toNum(
      pickStatField(rawStudents, ['thisMonth', 'monthly', 'addedThisMonth', 'newThisMonth']) ??
        d.studentsThisMonth ??
        d.newStudentsThisMonth ??
        d.monthlyStudents
    ),
    studentsMomGrowthPercent: toNullableNum(
      pickStatField(rawStudents, ['momGrowth', 'momGrowthPercent', 'growthPercentage', 'growthPercent', 'growth']) ??
        d.studentsMomGrowthPercent ??
        d.studentMomGrowth ??
        d.studentGrowthPercent ??
        d.studentsGrowth
    ),
    totalTestSeries: pickStatNumber(rawSeries),
    testSeriesAddedThisMonth: toNum(
      pickStatField(rawSeries, ['addedThisMonth', 'thisMonth', 'newThisMonth']) ??
        d.testSeriesAddedThisMonth ??
        d.newTestSeriesThisMonth
    ),
    totalTests: pickStatNumber(rawTests),
    publishedTests: toNum(
      pickStatField(rawTests, ['published', 'publishedTests']) ?? d.publishedTests ?? d.published
    ),
    draftTests: toNum(
      pickStatField(rawTests, ['draft', 'draftTests']) ?? d.draftTests ?? d.draft
    ),
    scheduledTests: toNum(
      pickStatField(rawTests, ['scheduled', 'scheduledTests']) ?? d.scheduledTests ?? d.scheduled
    ),
    totalQuestions: pickStatNumber(d.totalQuestions),
    totalTestAttempts: pickStatNumber(rawAttempts),
    attemptsGrowthPercent: toNullableNum(
      pickStatField(rawAttempts, ['growthPercentage', 'growthPercent', 'growth', 'momGrowth']) ??
        d.attemptsGrowthPercent ??
        d.attemptsGrowth ??
        d.testAttemptsGrowth
    ),
    activeStudents30Days: pickStatNumber(rawActive, ['count', 'total', 'last30Days', 'active30Days', 'value']),
    totalRevenue: pickStatNumber(rawRevenue, ['inr', 'amount', 'total', 'value']),
    revenueGrowthPercent: toNullableNum(
      pickStatField(rawRevenue, ['growthPercentage', 'growthPercent', 'growth', 'momGrowth']) ??
        d.revenueGrowthPercent ??
        d.revenueGrowth
    ),
  };
}

function normalizeGrowthArray(arr: unknown): ChartSeriesPoint[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    const r = asRecord(item);
    const label = toStr(
      r.label ?? r.date ?? r.day ?? r.week ?? r.month ?? r.period ?? r.weekStart ?? ''
    );
    const count = toNum(r.count ?? r.registrations ?? r.users ?? r.students ?? r.total ?? r.value);
    return {
      label,
      date: r.date ? toStr(r.date) : undefined,
      count,
    };
  });
}

export function normalizeStudentAnalytics(raw: unknown): StudentAnalytics {
  const root = asRecord(unwrapData(raw));
  const d = asRecord(root.studentAnalytics ?? root);
  const growth = asRecord(d.registrationGrowth);

  return {
    newRegistrationsToday: toNum(d.newRegistrationsToday),
    newRegistrationsThisWeek: toNum(d.newRegistrationsThisWeek),
    newRegistrationsThisMonth: toNum(d.newRegistrationsThisMonth),
    activeStudentsToday: toNum(d.activeStudentsToday),
    inactiveStudents: toNum(d.inactiveStudents),
    paidStudents: toNum(d.paidStudents),
    freeStudents: toNum(d.freeStudents),
    averageTestsAttemptedPerStudent: toNum(d.averageTestsAttemptedPerStudent),
    studentRetentionRate: toNum(d.studentRetentionRate),
    registrationGrowth: {
      daily: normalizeGrowthArray(growth.daily),
      weekly: normalizeGrowthArray(growth.weekly),
      monthly: normalizeGrowthArray(growth.monthly),
    },
  };
}

export function normalizeTestAnalytics(raw: unknown): TestAnalytics {
  const root = asRecord(unwrapData(raw));
  const d = asRecord(root.testAnalytics ?? root);
  const overviewRaw = Array.isArray(d.attemptsOverview) ? d.attemptsOverview : [];

  const attemptsOverview: AttemptsOverviewPoint[] = overviewRaw.map((item) => {
    const r = asRecord(item);
    const completed = toNum(r.completedAttempts ?? r.completed);
    const ongoing = toNum(r.ongoingAttempts ?? r.ongoing);
    const attempts = toNum(r.attempts ?? r.total ?? r.count, completed + ongoing);
    return {
      label: toStr(r.label ?? r.date ?? r.day ?? ''),
      date: r.date ? toStr(r.date) : undefined,
      attempts,
      completedAttempts: completed,
      ongoingAttempts: ongoing,
    };
  });

  const avgSec = toNum(d.averageTestCompletionTimeSeconds);
  const avgMin =
    d.averageTestCompletionTimeMinutes !== undefined
      ? toNum(d.averageTestCompletionTimeMinutes)
      : Number((avgSec / 60).toFixed(2));

  return {
    totalTestsCreated: toNum(d.totalTestsCreated ?? d.totalTests),
    publishedTests: toNum(d.publishedTests),
    draftTests: toNum(d.draftTests),
    scheduledTests: toNum(d.scheduledTests),
    completedAttempts: toNum(d.completedAttempts),
    ongoingAttempts: toNum(d.ongoingAttempts),
    averageTestScore: toNum(d.averageTestScore),
    averageTestCompletionTimeSeconds: avgSec,
    averageTestCompletionTimeMinutes: avgMin,
    testCompletionRate: toNum(d.testCompletionRate),
    attemptsOverview,
  };
}

function normalizeSeriesItem(raw: unknown): SeriesPerformanceItem | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as AnyRecord;
  return {
    id: (r.id ?? r.testSeriesId ?? r.test_series_id) as string | number | undefined,
    title: toStr(r.title ?? r.name, 'Untitled Series'),
    enrolled: toNum(r.enrolled ?? r.enrolledCount ?? r.enrollments),
    attempts: toNum(r.attempts ?? r.totalAttempts),
    completedAttempts: toNum(r.completedAttempts ?? r.completed),
    completionRate: toNum(r.completionRate),
    totalRevenue: toNum(r.totalRevenue ?? r.revenue),
    publishedAt: r.published_at || r.publishedAt ? toStr(r.published_at ?? r.publishedAt) : null,
    isPublished: r.is_published !== undefined ? Boolean(r.is_published) : r.isPublished !== undefined ? Boolean(r.isPublished) : undefined,
    price: r.price !== undefined ? toNum(r.price) : undefined,
  };
}

export function normalizeTestSeriesPerformance(raw: unknown): TestSeriesPerformance {
  const root = asRecord(unwrapData(raw));
  const d = asRecord(root.testSeriesPerformance ?? root);

  const rawList = Array.isArray(d.series)
    ? d.series
    : Array.isArray(d.seriesTable)
    ? d.seriesTable
    : Array.isArray(d.list)
    ? d.list
    : [];

  const series = rawList
    .map(normalizeSeriesItem)
    .filter((item): item is SeriesPerformanceItem => item !== null);

  const h = asRecord(d.highlights);
  const recentRaw = Array.isArray(d.recentlyPublishedSeries)
    ? d.recentlyPublishedSeries
    : Array.isArray(h.recentlyPublishedSeries)
    ? h.recentlyPublishedSeries
    : [];

  const recentlyPublishedList = recentRaw
    .map(normalizeSeriesItem)
    .filter((item): item is SeriesPerformanceItem => item !== null);

  const highlightRecent = Array.isArray(h.recentlyPublishedSeries)
    ? recentlyPublishedList[0] ?? null
    : normalizeSeriesItem(h.recentlyPublishedSeries) ?? recentlyPublishedList[0] ?? null;

  return {
    series,
    highlights: {
      mostPopularTestSeries: normalizeSeriesItem(h.mostPopularTestSeries),
      leastPopularTestSeries: normalizeSeriesItem(h.leastPopularTestSeries),
      highestRevenueSeries: normalizeSeriesItem(h.highestRevenueSeries),
      highestCompletionRateSeries: normalizeSeriesItem(h.highestCompletionRateSeries),
      recentlyPublishedSeries: highlightRecent,
    },
    recentlyPublishedSeries: recentlyPublishedList,
  };
}

export function normalizeRevenueAnalytics(raw: unknown): RevenueAnalytics {
  const root = asRecord(unwrapData(raw));
  const d = asRecord(root.revenueAnalytics ?? root);
  const refundsObj = asRecord(d.refunds);
  const monthlyRaw = Array.isArray(d.monthlyRevenue) ? d.monthlyRevenue : [];

  const monthlyRevenue: MonthlyRevenuePoint[] = monthlyRaw.map((item) => {
    const r = asRecord(item);
    return {
      label: toStr(r.label ?? r.month ?? r.period ?? r.date ?? ''),
      month: r.month ? toStr(r.month) : undefined,
      revenue: toNum(r.revenue ?? r.amount ?? r.totalRevenue ?? r.total),
      paymentsCount: r.paymentsCount !== undefined ? toNum(r.paymentsCount ?? r.count) : r.count !== undefined ? toNum(r.count) : undefined,
    };
  });

  return {
    totalRevenue: toNum(d.totalRevenue),
    revenueToday: toNum(d.revenueToday),
    revenueThisMonth: toNum(d.revenueThisMonth),
    successfulPayments: toNum(d.successfulPayments),
    failedPayments: toNum(d.failedPayments),
    pendingPayments: toNum(d.pendingPayments),
    refundsCount: toNum(d.refundsCount ?? refundsObj.count),
    refundsAmount: toNum(d.refundsAmount ?? refundsObj.amount),
    totalPaidSubscriptions: toNum(d.totalPaidSubscriptions),
    averageOrderValue: toNum(d.averageOrderValue),
    monthlyRevenue,
  };
}

export function normalizeStudentPerformanceAnalytics(raw: unknown): StudentPerformanceAnalytics {
  const root = asRecord(unwrapData(raw));
  const d = asRecord(root.studentPerformanceAnalytics ?? root);
  const subjectsRaw = Array.isArray(d.subjectWisePerformance) ? d.subjectWisePerformance : [];

  const subjectWisePerformance: SubjectPerformanceItem[] = subjectsRaw.map((item) => {
    const r = asRecord(item);
    return {
      subjectId: (r.subjectId ?? r.subject_id ?? r.id) as string | number | undefined,
      subjectName: toStr(r.subjectName ?? r.subject_name ?? r.subject ?? r.name, 'Unknown Subject'),
      attempts: toNum(r.attempts ?? r.totalAttempts),
      averageScore: toNum(r.averageScore ?? r.avgScore),
      averageAccuracy: toNum(r.averageAccuracy ?? r.accuracy),
      passPercentage: toNum(r.passPercentage ?? r.passRate),
    };
  });

  const avgSec = toNum(d.averageCompletionTimeSeconds);
  const avgMin =
    d.averageCompletionTimeMinutes !== undefined
      ? toNum(d.averageCompletionTimeMinutes)
      : Number((avgSec / 60).toFixed(2));

  return {
    averageStudentScore: toNum(d.averageStudentScore),
    highestScore: toNum(d.highestScore),
    lowestScore: toNum(d.lowestScore),
    averageAccuracy: toNum(d.averageAccuracy),
    averageCompletionTimeSeconds: avgSec,
    averageCompletionTimeMinutes: avgMin,
    passPercentage: toNum(d.passPercentage),
    studentsImproving: toNum(d.studentsImproving),
    studentsStruggling: toNum(d.studentsStruggling),
    subjectWisePerformance,
  };
}

export function normalizeFullDashboard(raw: unknown): FullDashboardData {
  const root = asRecord(unwrapData(raw));
  return {
    overview: normalizeOverviewStats(root.overview ?? root),
    studentAnalytics: normalizeStudentAnalytics(root.studentAnalytics ?? root),
    testAnalytics: normalizeTestAnalytics(root.testAnalytics ?? root),
    testSeriesPerformance: normalizeTestSeriesPerformance(root.testSeriesPerformance ?? root),
    revenueAnalytics: normalizeRevenueAnalytics(root.revenueAnalytics ?? root),
    studentPerformanceAnalytics: normalizeStudentPerformanceAnalytics(
      root.studentPerformanceAnalytics ?? root
    ),
  };
}

export function normalizePayment(raw: unknown): Payment {
  const r = asRecord(raw);
  const user = asRecord(r.user);
  const series = asRecord(r.testSeries ?? r.test_series);

  return {
    id: (r.id ?? r.payment_id ?? '') as string | number,
    userId: (r.user_id ?? r.userId ?? user.id) as string | number | undefined,
    user: Object.keys(user).length
      ? {
          id: (user.id ?? r.user_id ?? '') as string | number,
          name: user.name ? toStr(user.name) : undefined,
          username: user.username ? toStr(user.username) : undefined,
          email: user.email ? toStr(user.email) : undefined,
          phone: user.phone ? toStr(user.phone) : undefined,
        }
      : null,
    userName: toStr(r.user_name ?? r.userName ?? user.name ?? user.username ?? ''),
    userEmail: toStr(r.user_email ?? r.userEmail ?? user.email ?? ''),
    testSeriesId: (r.test_series_id ?? r.testSeriesId ?? series.id ?? null) as string | number | null,
    testSeries: Object.keys(series).length
      ? {
          id: (series.id ?? r.test_series_id ?? '') as string | number,
          title: series.title ? toStr(series.title) : undefined,
          price: series.price !== undefined ? toNum(series.price) : undefined,
        }
      : null,
    testSeriesTitle: toStr(r.test_series_title ?? r.testSeriesTitle ?? series.title ?? ''),
    subscriptionId: (r.subscription_id ?? r.subscriptionId ?? null) as string | number | null,
    amount: toNum(r.amount),
    currency: toStr(r.currency, 'INR'),
    status: toStr(r.status, 'PENDING').toUpperCase(),
    paymentMethod: toStr(r.payment_method ?? r.paymentMethod ?? r.method ?? r.gateway ?? ''),
    gateway: toStr(r.gateway ?? ''),
    transactionId: toStr(r.transaction_id ?? r.transactionId ?? r.reference_id ?? r.referenceId ?? r.order_id ?? ''),
    referenceId: toStr(r.reference_id ?? r.referenceId ?? ''),
    paidAt: r.paid_at || r.paidAt ? toStr(r.paid_at ?? r.paidAt) : null,
    refundedAt: r.refunded_at || r.refundedAt ? toStr(r.refunded_at ?? r.refundedAt) : null,
    refundReason: r.refund_reason || r.refundReason ? toStr(r.refund_reason ?? r.refundReason) : null,
    refundAmount: r.refund_amount !== undefined || r.refundAmount !== undefined ? toNum(r.refund_amount ?? r.refundAmount) : null,
    notes: r.notes ? toStr(r.notes) : null,
    createdAt: toStr(r.created_at ?? r.createdAt ?? ''),
    updatedAt: toStr(r.updated_at ?? r.updatedAt ?? ''),
    raw: r,
  };
}

export function normalizeSubscription(raw: unknown): Subscription {
  const r = asRecord(raw);
  const user = asRecord(r.user);
  const series = asRecord(r.testSeries ?? r.test_series);

  return {
    id: (r.id ?? r.subscription_id ?? '') as string | number,
    userId: (r.user_id ?? r.userId ?? user.id) as string | number | undefined,
    userName: toStr(r.user_name ?? r.userName ?? user.name ?? user.username ?? ''),
    userEmail: toStr(r.user_email ?? r.userEmail ?? user.email ?? ''),
    testSeriesId: (r.test_series_id ?? r.testSeriesId ?? series.id ?? null) as string | number | null,
    testSeriesTitle: toStr(r.test_series_title ?? r.testSeriesTitle ?? series.title ?? ''),
    planName: toStr(r.plan_name ?? r.planName ?? r.plan ?? 'Standard Plan'),
    planType: toStr(r.plan_type ?? r.planType ?? ''),
    amount: toNum(r.amount ?? r.price),
    currency: toStr(r.currency, 'INR'),
    status: toStr(r.status, 'ACTIVE').toUpperCase(),
    startsAt: r.starts_at || r.startsAt || r.start_date || r.startDate ? toStr(r.starts_at ?? r.startsAt ?? r.start_date ?? r.startDate) : null,
    expiresAt: r.expires_at || r.expiresAt || r.end_date || r.endDate ? toStr(r.expires_at ?? r.expiresAt ?? r.end_date ?? r.endDate) : null,
    paymentId: (r.payment_id ?? r.paymentId ?? null) as string | number | null,
    notes: r.notes ? toStr(r.notes) : null,
    createdAt: toStr(r.created_at ?? r.createdAt ?? ''),
    updatedAt: toStr(r.updated_at ?? r.updatedAt ?? ''),
    raw: r,
  };
}

export function normalizeEnrollment(raw: unknown): Enrollment {
  const r = asRecord(raw);
  const user = asRecord(r.user);
  const series = asRecord(r.testSeries ?? r.test_series);

  return {
    id: (r.id ?? r.enrollment_id ?? '') as string | number,
    userId: (r.user_id ?? r.userId ?? user.id) as string | number | undefined,
    userName: toStr(r.user_name ?? r.userName ?? user.name ?? user.username ?? ''),
    userEmail: toStr(r.user_email ?? r.userEmail ?? user.email ?? ''),
    testSeriesId: (r.test_series_id ?? r.testSeriesId ?? series.id) as string | number | undefined,
    testSeriesTitle: toStr(r.test_series_title ?? r.testSeriesTitle ?? series.title ?? ''),
    accessType: toStr(r.access_type ?? r.accessType ?? r.source ?? ''),
    source: toStr(r.source ?? r.access_type ?? r.accessType ?? ''),
    paymentId: (r.payment_id ?? r.paymentId ?? null) as string | number | null,
    subscriptionId: (r.subscription_id ?? r.subscriptionId ?? null) as string | number | null,
    status: toStr(r.status, 'ACTIVE').toUpperCase(),
    enrolledAt: r.enrolled_at || r.enrolledAt || r.created_at || r.createdAt ? toStr(r.enrolled_at ?? r.enrolledAt ?? r.created_at ?? r.createdAt) : null,
    expiresAt: r.expires_at || r.expiresAt ? toStr(r.expires_at ?? r.expiresAt) : null,
    notes: r.notes ? toStr(r.notes) : null,
    createdAt: toStr(r.created_at ?? r.createdAt ?? ''),
    updatedAt: toStr(r.updated_at ?? r.updatedAt ?? ''),
    raw: r,
  };
}


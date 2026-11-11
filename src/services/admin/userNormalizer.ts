import type { Payment } from '../../types/admin/payment';
import type {
  PaginationMeta,
  User,
  UserActivityItem,
  UserActivityResponse,
  UserAnalytics,
  UserAttemptInspection,
  UserAttemptQuestionOption,
  UserAttemptQuestionReview,
  UserEngagement,
  UserImprovementTracker,
  UserLoginHistoryItem,
  UserPaymentListResponse,
  UserPerformanceTrendPoint,
  UserProfileOverview,
  UserQuickStats,
  UsersListResponse,
  UserSubjectBreakdown,
  UserTestAttempt,
  UserTestHistoryResponse,
  UserTestSeriesEnrollment,
  UserTestSeriesListResponse,
  UserWeakSubject,
} from '../../types/admin/user';
import {
  asRecord,
  extractArray,
  normalizeEnrollment,
  normalizePayment,
  toNullableNum,
  toNum,
  toStr,
  unwrapData,
} from './dashboardNormalizer';

type AnyRecord = Record<string, unknown>;

export function normalizePagination(
  raw: unknown,
  fallbackCount = 0,
  fallbackPage = 1,
  fallbackLimit = 10
): PaginationMeta {
  const root = asRecord(unwrapData(raw));
  const rootOuter = asRecord(raw);
  const p = asRecord(
    root.pagination ?? root.meta ?? rootOuter.pagination ?? rootOuter.meta ?? root
  );

  const page = Math.max(1, toNum(p.page ?? p.currentPage ?? p.current_page, fallbackPage));
  const limit = Math.max(1, toNum(p.limit ?? p.perPage ?? p.per_page ?? p.pageSize, fallbackLimit));
  const total = Math.max(
    0,
    toNum(p.total ?? p.totalItems ?? p.total_items ?? p.totalCount ?? p.count, fallbackCount)
  );
  const computedPages = Math.max(1, Math.ceil(total / limit));
  const totalPages = Math.max(
    1,
    toNum(p.totalPages ?? p.total_pages ?? p.pages, computedPages)
  );

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: p.hasNext !== undefined ? Boolean(p.hasNext) : p.has_next !== undefined ? Boolean(p.has_next) : page < totalPages,
    hasPrev: p.hasPrev !== undefined ? Boolean(p.hasPrev) : p.has_prev !== undefined ? Boolean(p.has_prev) : page > 1,
  };
}

function normalizeEngagement(raw: unknown, userObj?: AnyRecord): UserEngagement {
  const e = asRecord(raw);
  const u = userObj ?? {};
  const lastLogin =
    e.lastLoginAt ??
    e.last_login_at ??
    u.lastLoginAt ??
    u.last_login_at ??
    null;
  const lastActive =
    e.lastActiveAt ??
    e.last_active_at ??
    u.lastActiveAt ??
    u.last_active_at ??
    lastLogin ??
    null;

  const status = toStr(
    e.status ?? e.engagementStatus ?? e.engagement_status ?? u.engagementStatus ?? u.engagement_status ?? 'inactive'
  );

  return {
    status,
    label: e.label ? toStr(e.label) : undefined,
    daysSinceLastActive: toNullableNum(
      e.daysSinceLastActive ?? e.days_since_last_active ?? e.inactiveDays ?? e.inactive_days
    ),
    testsLast7Days: toNum(e.testsLast7Days ?? e.tests_last_7_days ?? e.attemptsLast7Days),
    testsLast30Days: toNum(e.testsLast30Days ?? e.tests_last_30_days ?? e.attemptsLast30Days),
    streakDays: toNum(e.streakDays ?? e.streak_days ?? e.streak),
    loginCount: toNum(e.loginCount ?? e.login_count ?? e.totalLogins),
    lastLoginAt: lastLogin ? toStr(lastLogin) : null,
    lastActiveAt: lastActive ? toStr(lastActive) : null,
  };
}

function normalizeQuickStats(raw: unknown, rootFallback?: AnyRecord): UserQuickStats {
  const s = asRecord(raw);
  const f = rootFallback ?? {};
  return {
    totalAttempts: toNum(s.totalAttempts ?? s.total_attempts ?? s.attemptsCount ?? f.totalAttempts),
    completedAttempts: toNum(
      s.completedAttempts ?? s.completed_attempts ?? s.completedTests ?? f.completedAttempts
    ),
    ongoingAttempts: toNum(s.ongoingAttempts ?? s.ongoing_attempts),
    averageScore: toNum(s.averageScore ?? s.average_score ?? s.avgScore ?? f.averageScore),
    bestScore: toNum(s.bestScore ?? s.best_score ?? s.highestScore ?? s.highest_score),
    averageAccuracy: toNum(s.averageAccuracy ?? s.average_accuracy ?? s.accuracy),
    passRate: toNum(s.passRate ?? s.pass_rate ?? s.passPercentage),
    totalTimeSpentSeconds: toNum(
      s.totalTimeSpentSeconds ?? s.total_time_spent_seconds ?? s.totalStudyTimeSeconds
    ),
    enrolledSeriesCount: toNum(
      s.enrolledSeriesCount ?? s.enrolled_series_count ?? s.totalEnrolledSeries ?? s.enrollmentsCount
    ),
    activeSeriesCount: toNum(s.activeSeriesCount ?? s.active_series_count ?? s.activeEnrollments),
    totalPaymentsCount: toNum(s.totalPaymentsCount ?? s.total_payments_count ?? s.paymentsCount),
    totalSpent: toNum(s.totalSpent ?? s.total_spent ?? s.totalPaid ?? s.totalRevenue),
    lastAttemptAt:
      s.lastAttemptAt || s.last_attempt_at
        ? toStr(s.lastAttemptAt ?? s.last_attempt_at)
        : null,
    rank: toNullableNum(s.rank ?? s.overallRank ?? s.currentRank),
  };
}

export function normalizeUser(raw: unknown): User {
  const r = asRecord(raw);
  const subStatus = toStr(
    r.subscriptionStatus ?? r.subscription_status ?? r.subscription ?? 'free'
  ).toLowerCase();
  const lastLogin = r.lastLoginAt ?? r.last_login_at ?? null;
  const lastActive = r.lastActiveAt ?? r.last_active_at ?? null;

  const engagement =
    r.engagement || r.engagementStatus || r.engagement_status
      ? normalizeEngagement(r.engagement, r)
      : undefined;
  const quickStats =
    r.quickStats || r.quick_stats || r.stats
      ? normalizeQuickStats(r.quickStats ?? r.quick_stats ?? r.stats, r)
      : undefined;

  return {
    id: (r.id ?? r.userId ?? r.user_id ?? '') as string | number,
    name: toStr(r.name ?? r.fullName ?? r.full_name ?? r.username ?? ''),
    username: toStr(r.username ?? ''),
    email: toStr(r.email ?? ''),
    phone: toStr(r.phone ?? r.mobile ?? r.phoneNumber ?? r.phone_number ?? ''),
    role: toStr(r.role ?? 'student'),
    status: toStr(r.status ?? (r.is_active === false ? 'inactive' : 'active')).toLowerCase(),
    subscriptionStatus: subStatus,
    subscription_status: subStatus,
    isVerified: r.isVerified !== undefined ? Boolean(r.isVerified) : r.is_verified !== undefined ? Boolean(r.is_verified) : undefined,
    avatar: r.avatar ? toStr(r.avatar) : null,
    lastLoginAt: lastLogin ? toStr(lastLogin) : null,
    last_login_at: lastLogin ? toStr(lastLogin) : null,
    lastActiveAt: lastActive ? toStr(lastActive) : null,
    last_active_at: lastActive ? toStr(lastActive) : null,
    createdAt: toStr(r.createdAt ?? r.created_at ?? ''),
    updatedAt: toStr(r.updatedAt ?? r.updated_at ?? ''),
    engagementStatus: engagement?.status ?? (r.engagementStatus ? toStr(r.engagementStatus) : undefined),
    engagement,
    quickStats,
    raw: r,
  };
}

export function normalizeUsersList(raw: unknown): UsersListResponse {
  const unwrapped = unwrapData(raw);
  const root = asRecord(unwrapped);
  const list = extractArray(raw, ['users', 'students', 'items', 'rows']).map(normalizeUser);
  const pagination = normalizePagination(raw, list.length, 1, 20);
  const summaryRec = asRecord(root.summary);

  return {
    users: list,
    pagination,
    summary: Object.keys(summaryRec).length
      ? {
          total: toNum(summaryRec.total, pagination.total),
          active: toNum(summaryRec.active),
          inactive: toNum(summaryRec.inactive),
          blocked: toNum(summaryRec.blocked),
          paid: toNum(summaryRec.paid),
        }
      : undefined,
  };
}

export function normalizeUserProfileOverview(raw: unknown): UserProfileOverview {
  const unwrapped = asRecord(unwrapData(raw));
  const userRec = asRecord(unwrapped.user ?? unwrapped.student ?? unwrapped.profile ?? unwrapped);
  const user = normalizeUser(userRec);
  const engagement = normalizeEngagement(
    unwrapped.engagement ?? unwrapped.engagementDetails ?? userRec.engagement,
    { ...userRec, ...unwrapped }
  );
  const quickStats = normalizeQuickStats(
    unwrapped.quickStats ?? unwrapped.quick_stats ?? unwrapped.stats ?? unwrapped.summary ?? userRec.stats,
    unwrapped
  );

  return {
    user: {
      ...user,
      engagementStatus: engagement.status,
      engagement,
      quickStats,
    },
    engagement,
    quickStats,
    raw: unwrapped,
  };
}

function normalizeSubjectBreakdownItem(raw: unknown): UserSubjectBreakdown {
  const r = asRecord(raw);
  return {
    subjectId: (r.subjectId ?? r.subject_id ?? r.id) as string | number | undefined,
    subjectName: toStr(
      r.subjectName ?? r.subject_name ?? r.subject ?? r.name,
      'General'
    ),
    attempts: toNum(r.attempts ?? r.totalAttempts ?? r.questionsAttempted),
    totalQuestions: toNum(r.totalQuestions ?? r.total_questions ?? r.questionsCount),
    correctAnswers: toNum(r.correctAnswers ?? r.correct_answers ?? r.correct),
    wrongAnswers: toNum(r.wrongAnswers ?? r.wrong_answers ?? r.wrong ?? r.incorrect),
    skippedQuestions: toNum(r.skippedQuestions ?? r.skipped_questions ?? r.skipped),
    averageScore: toNum(r.averageScore ?? r.average_score ?? r.avgScore ?? r.score),
    averageAccuracy: toNum(r.averageAccuracy ?? r.average_accuracy ?? r.accuracy),
    passRate: toNum(r.passRate ?? r.pass_rate ?? r.passPercentage),
    strengthLevel: r.strengthLevel || r.strength_level || r.level ? toStr(r.strengthLevel ?? r.strength_level ?? r.level) : undefined,
  };
}

export function normalizeUserAnalytics(raw: unknown): UserAnalytics {
  const root = asRecord(unwrapData(raw));
  const d = asRecord(root.analytics ?? root);
  const m = asRecord(d.metrics ?? d.performance ?? d.summary ?? d.overview ?? d);

  const rawSubjects = Array.isArray(d.subjectWiseBreakdown)
    ? d.subjectWiseBreakdown
    : Array.isArray(d.subjectBreakdown)
    ? d.subjectBreakdown
    : Array.isArray(d.subjectWisePerformance)
    ? d.subjectWisePerformance
    : Array.isArray(d.subjects)
    ? d.subjects
    : [];

  const subjectWiseBreakdown: UserSubjectBreakdown[] = rawSubjects.map(normalizeSubjectBreakdownItem);

  const rawTrend = Array.isArray(d.trend)
    ? d.trend
    : Array.isArray(d.performanceTrend)
    ? d.performanceTrend
    : Array.isArray(d.scoreTrend)
    ? d.scoreTrend
    : [];

  const trend: UserPerformanceTrendPoint[] = rawTrend.map((item, idx) => {
    const r = asRecord(item);
    const totalMarks = toNum(r.totalMarks ?? r.total_marks ?? r.maxScore, 100);
    const score = toNum(r.score ?? r.marksObtained);
    const percentage =
      r.percentage !== undefined
        ? toNum(r.percentage)
        : totalMarks > 0
        ? Number(((score / totalMarks) * 100).toFixed(1))
        : 0;

    return {
      label: toStr(
        r.label ?? r.testTitle ?? r.test_title ?? r.date ?? `Test #${idx + 1}`
      ),
      date: r.date ?? r.submittedAt ?? r.submitted_at ? toStr(r.date ?? r.submittedAt ?? r.submitted_at) : undefined,
      testTitle: r.testTitle ?? r.test_title ? toStr(r.testTitle ?? r.test_title) : undefined,
      attemptId: (r.attemptId ?? r.attempt_id ?? r.id) as string | number | undefined,
      score,
      totalMarks,
      percentage,
      accuracy: toNum(r.accuracy),
    };
  });

  const imp = asRecord(d.improvementTracker ?? d.improvement_tracker ?? d.improvement);
  const scoreDelta = toNum(imp.scoreDelta ?? imp.score_delta ?? imp.delta ?? imp.change);
  const direction = toStr(
    imp.direction ??
      imp.trendDirection ??
      imp.trend ??
      (scoreDelta > 0 ? 'improving' : scoreDelta < 0 ? 'declining' : 'stable')
  ).toLowerCase();

  const improvementTracker: UserImprovementTracker = {
    status: toStr(imp.status ?? direction ?? 'stable'),
    direction,
    scoreDelta,
    accuracyDelta: toNum(imp.accuracyDelta ?? imp.accuracy_delta),
    earlyAverageScore: toNum(imp.earlyAverageScore ?? imp.early_average_score ?? imp.previousAverage),
    recentAverageScore: toNum(imp.recentAverageScore ?? imp.recent_average_score ?? imp.currentAverage),
    earlyAccuracy: toNum(imp.earlyAccuracy ?? imp.early_accuracy),
    recentAccuracy: toNum(imp.recentAccuracy ?? imp.recent_accuracy),
    comparedAttemptsCount:
      imp.comparedAttemptsCount !== undefined
        ? toNum(imp.comparedAttemptsCount)
        : undefined,
    summaryText: imp.summaryText ?? imp.summary ?? imp.message ? toStr(imp.summaryText ?? imp.summary ?? imp.message) : undefined,
  };

  const rawWeak = Array.isArray(d.weakSubjects)
    ? d.weakSubjects
    : Array.isArray(d.weak_subjects)
    ? d.weak_subjects
    : Array.isArray(d.weakAreas)
    ? d.weakAreas
    : [];

  const weakSubjects: UserWeakSubject[] = rawWeak.map((item) => {
    const r = asRecord(item);
    return {
      subjectId: (r.subjectId ?? r.subject_id ?? r.id) as string | number | undefined,
      subjectName: toStr(r.subjectName ?? r.subject_name ?? r.subject ?? r.name, 'Unknown Subject'),
      averageAccuracy: toNum(r.averageAccuracy ?? r.average_accuracy ?? r.accuracy),
      averageScore: toNum(r.averageScore ?? r.average_score ?? r.avgScore),
      attempts: toNum(r.attempts ?? r.totalAttempts),
      wrongAnswers: r.wrongAnswers !== undefined ? toNum(r.wrongAnswers) : undefined,
      recommendation: r.recommendation ?? r.note ? toStr(r.recommendation ?? r.note) : undefined,
    };
  });

  return {
    metrics: {
      totalAttempts: toNum(m.totalAttempts ?? m.total_attempts),
      completedAttempts: toNum(m.completedAttempts ?? m.completed_attempts),
      averageScore: toNum(m.averageScore ?? m.average_score ?? m.avgScore),
      highestScore: toNum(m.highestScore ?? m.highest_score ?? m.bestScore ?? m.best_score),
      lowestScore: toNum(m.lowestScore ?? m.lowest_score),
      averageAccuracy: toNum(m.averageAccuracy ?? m.average_accuracy ?? m.accuracy),
      passRate: toNum(m.passRate ?? m.pass_rate ?? m.passPercentage),
      averageTimeSeconds: toNum(m.averageTimeSeconds ?? m.average_time_seconds ?? m.avgCompletionTimeSeconds),
      totalTimeSpentSeconds: toNum(m.totalTimeSpentSeconds ?? m.total_time_spent_seconds),
      bestPercentage: toNum(m.bestPercentage ?? m.best_percentage ?? m.highestPercentage),
      currentRank: toNullableNum(m.currentRank ?? m.rank ?? m.latestRank),
      bestPercentile: toNullableNum(m.bestPercentile ?? m.percentile),
    },
    subjectWiseBreakdown,
    trend,
    improvementTracker,
    weakSubjects,
  };
}

export function normalizeTestAttempt(raw: unknown): UserTestAttempt {
  const r = asRecord(raw);
  const test = asRecord(r.test);
  const series = asRecord(r.testSeries ?? r.test_series);

  const score = toNum(r.score ?? r.marksObtained ?? r.marks_obtained);
  const totalMarks = toNum(r.totalMarks ?? r.total_marks ?? test.totalMarks ?? test.total_marks, 100);
  const percentage =
    r.percentage !== undefined
      ? toNum(r.percentage)
      : totalMarks > 0
      ? Number(((score / totalMarks) * 100).toFixed(1))
      : 0;

  const correct = toNum(r.correctAnswers ?? r.correct_answers ?? r.correct);
  const wrong = toNum(r.wrongAnswers ?? r.wrong_answers ?? r.wrong ?? r.incorrect);
  const skipped = toNum(r.skippedQuestions ?? r.skipped_questions ?? r.skipped ?? r.unattempted);
  const totalQ = toNum(
    r.totalQuestions ?? r.total_questions ?? test.totalQuestions,
    correct + wrong + skipped
  );
  const attempted = correct + wrong;
  const accuracy =
    r.accuracy !== undefined
      ? toNum(r.accuracy)
      : attempted > 0
      ? Number(((correct / attempted) * 100).toFixed(1))
      : 0;

  return {
    id: (r.id ?? r.attemptId ?? r.attempt_id ?? '') as string | number,
    attemptId: (r.attemptId ?? r.attempt_id ?? r.id ?? '') as string | number,
    testId: (r.testId ?? r.test_id ?? test.id) as string | number | undefined,
    testTitle: toStr(
      r.testTitle ?? r.test_title ?? r.testName ?? test.title ?? test.name,
      `Test #${r.test_id ?? r.testId ?? r.id ?? ''}`
    ),
    testSeriesId: (r.testSeriesId ?? r.test_series_id ?? series.id ?? null) as string | number | null,
    testSeriesTitle: toStr(
      r.testSeriesTitle ?? r.test_series_title ?? series.title ?? ''
    ),
    status: toStr(r.status ?? 'COMPLETED').toUpperCase(),
    score,
    totalMarks,
    percentage,
    accuracy,
    rank: toNullableNum(r.rank),
    percentile: toNullableNum(r.percentile),
    correctAnswers: correct,
    wrongAnswers: wrong,
    skippedQuestions: skipped,
    totalQuestions: totalQ,
    timeTakenSeconds: toNum(r.timeTakenSeconds ?? r.time_taken_seconds ?? r.durationSeconds),
    startedAt: r.startedAt ?? r.started_at ?? r.start_time ? toStr(r.startedAt ?? r.started_at ?? r.start_time) : null,
    submittedAt: r.submittedAt ?? r.submitted_at ? toStr(r.submittedAt ?? r.submitted_at) : null,
    createdAt: r.createdAt ?? r.created_at ?? r.submitted_at ?? r.started_at ? toStr(r.createdAt ?? r.created_at ?? r.submitted_at ?? r.started_at) : null,
    raw: r,
  };
}

export function normalizeUserTestHistory(raw: unknown): UserTestHistoryResponse {
  const attempts = extractArray(raw, [
    'attempts',
    'testHistory',
    'test_history',
    'history',
    'results',
    'items',
    'rows',
  ]).map(normalizeTestAttempt);

  return {
    attempts,
    pagination: normalizePagination(raw, attempts.length, 1, 10),
  };
}

function normalizeQuestionOptions(q: AnyRecord): UserAttemptQuestionOption[] {
  const rawOptions = q.options ?? q.choices;
  const correctOpt = q.correctOption ?? q.correct_option ?? q.correctAnswer ?? q.correct_answer;

  if (Array.isArray(rawOptions)) {
    return rawOptions.map((opt, idx) => {
      if (typeof opt === 'string') {
        const key = String.fromCharCode(65 + idx);
        return {
          key,
          text: opt,
          isCorrect: correctOpt !== undefined && String(correctOpt).toUpperCase() === key,
        };
      }
      const o = asRecord(opt);
      const key = toStr(o.key ?? o.label ?? o.option ?? o.id ?? String.fromCharCode(65 + idx));
      return {
        key,
        text: toStr(o.text ?? o.value ?? o.labelText ?? o.content ?? ''),
        isCorrect:
          o.isCorrect !== undefined
            ? Boolean(o.isCorrect)
            : correctOpt !== undefined && String(correctOpt).toUpperCase() === key.toUpperCase(),
      };
    });
  }

  if (rawOptions && typeof rawOptions === 'object') {
    return Object.entries(rawOptions as AnyRecord).map(([key, val]) => ({
      key,
      text: toStr(val),
      isCorrect:
        correctOpt !== undefined && String(correctOpt).toUpperCase() === key.toUpperCase(),
    }));
  }

  const keys = ['A', 'B', 'C', 'D', 'E'] as const;
  const fallbackOptions: UserAttemptQuestionOption[] = [];
  for (const k of keys) {
    const lower = k.toLowerCase();
    const val = q[`option_${lower}`] ?? q[`option${k}`];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      fallbackOptions.push({
        key: k,
        text: toStr(val),
        isCorrect:
          correctOpt !== undefined && String(correctOpt).toUpperCase() === k,
      });
    }
  }
  return fallbackOptions;
}

export function normalizeUserAttemptInspection(raw: unknown): UserAttemptInspection {
  const unwrapped = asRecord(unwrapData(raw));
  const summaryRec = asRecord(
    unwrapped.summary ?? unwrapped.attempt ?? unwrapped.result ?? unwrapped
  );
  const testRec = asRecord(unwrapped.test ?? summaryRec.test);
  const seriesRec = asRecord(unwrapped.testSeries ?? unwrapped.test_series ?? summaryRec.testSeries);

  const attempt = normalizeTestAttempt({
    ...unwrapped,
    ...summaryRec,
    test: testRec,
    testSeries: seriesRec,
  });

  const rawSubjectBreakdown = Array.isArray(unwrapped.subjectBreakdown)
    ? unwrapped.subjectBreakdown
    : Array.isArray(unwrapped.subject_breakdown)
    ? unwrapped.subject_breakdown
    : Array.isArray(unwrapped.subjects)
    ? unwrapped.subjects
    : [];

  const rawQuestions = Array.isArray(unwrapped.questions)
    ? unwrapped.questions
    : Array.isArray(unwrapped.answers)
    ? unwrapped.answers
    : Array.isArray(unwrapped.responses)
    ? unwrapped.responses
    : Array.isArray(unwrapped.questionReview)
    ? unwrapped.questionReview
    : [];

  const questions: UserAttemptQuestionReview[] = rawQuestions.map((item, idx) => {
    const q = asRecord(item);
    const nestedQ = asRecord(q.question);
    const merged: AnyRecord = { ...nestedQ, ...q };
    const selected =
      merged.selectedOption ??
      merged.selected_option ??
      merged.userAnswer ??
      merged.user_answer ??
      merged.chosenOption ??
      null;
    const correct =
      merged.correctOption ??
      merged.correct_option ??
      merged.correctAnswer ??
      merged.correct_answer ??
      null;
    const isSkipped =
      merged.isSkipped !== undefined
        ? Boolean(merged.isSkipped)
        : merged.is_skipped !== undefined
        ? Boolean(merged.is_skipped)
        : selected === null || selected === undefined || String(selected).trim() === '';
    const isCorrect =
      merged.isCorrect !== undefined
        ? Boolean(merged.isCorrect)
        : merged.is_correct !== undefined
        ? Boolean(merged.is_correct)
        : !isSkipped &&
          correct !== null &&
          String(selected).trim().toUpperCase() === String(correct).trim().toUpperCase();

    return {
      id: (merged.id ?? merged.questionId ?? merged.question_id ?? idx + 1) as string | number,
      order: toNum(merged.order ?? merged.questionNumber ?? merged.question_number, idx + 1),
      questionText: toStr(
        merged.questionText ?? merged.question_text ?? merged.text ?? merged.title,
        `Question ${idx + 1}`
      ),
      subjectName: merged.subjectName ?? merged.subject_name ?? merged.subject ? toStr(merged.subjectName ?? merged.subject_name ?? merged.subject) : undefined,
      topicName: merged.topicName ?? merged.topic_name ? toStr(merged.topicName ?? merged.topic_name) : undefined,
      difficulty: merged.difficulty ? toStr(merged.difficulty) : undefined,
      options: normalizeQuestionOptions(merged),
      selectedOption: selected !== null && selected !== undefined ? toStr(selected) : null,
      correctOption: correct !== null && correct !== undefined ? toStr(correct) : null,
      isCorrect,
      isSkipped,
      marksAwarded: toNum(merged.marksAwarded ?? merged.marks_awarded ?? merged.score),
      maxMarks: toNum(merged.maxMarks ?? merged.max_marks ?? merged.marks, 1),
      timeSpentSeconds: toNullableNum(merged.timeSpentSeconds ?? merged.time_spent_seconds),
      explanation: merged.explanation ?? merged.solution ? toStr(merged.explanation ?? merged.solution) : null,
    };
  });

  return {
    attempt,
    test: Object.keys(testRec).length
      ? {
          id: (testRec.id ?? attempt.testId) as string | number | undefined,
          title: toStr(testRec.title ?? testRec.name, attempt.testTitle),
          durationMinutes: testRec.durationMinutes ?? testRec.duration_minutes ? toNum(testRec.durationMinutes ?? testRec.duration_minutes) : undefined,
          totalMarks: testRec.totalMarks ?? testRec.total_marks ? toNum(testRec.totalMarks ?? testRec.total_marks) : attempt.totalMarks,
          passingMarks: testRec.passingMarks ?? testRec.passing_marks ? toNum(testRec.passingMarks ?? testRec.passing_marks) : undefined,
          negativeMarking: (() => {
            const neg = testRec.negativeMarking ?? testRec.negative_marking;
            if (typeof neg === 'boolean') return neg;
            if (neg !== undefined && neg !== null && neg !== '') return toNum(neg);
            return undefined;
          })(),
        }
      : undefined,
    testSeries: Object.keys(seriesRec).length
      ? {
          id: (seriesRec.id ?? attempt.testSeriesId) as string | number | undefined,
          title: toStr(seriesRec.title ?? seriesRec.name, attempt.testSeriesTitle || ''),
        }
      : null,
    subjectBreakdown: rawSubjectBreakdown.map(normalizeSubjectBreakdownItem),
    questions,
    raw: unwrapped,
  };
}

export function normalizeUserTestSeries(raw: unknown): UserTestSeriesListResponse {
  const unwrapped = asRecord(unwrapData(raw));
  const rawList = extractArray(raw, [
    'enrollments',
    'testSeries',
    'test_series',
    'series',
    'items',
    'rows',
  ]);

  const enrollments: UserTestSeriesEnrollment[] = rawList.map((item) => {
    const r = asRecord(item);
    const base = normalizeEnrollment(item);
    const series = asRecord(r.testSeries ?? r.test_series);

    const testsCompleted = toNum(r.testsCompleted ?? r.tests_completed ?? r.completedTests);
    const totalTests = toNum(r.totalTests ?? r.total_tests ?? series.totalTests ?? series.total_tests);
    const progressPercent =
      r.progressPercent !== undefined || r.progress_percent !== undefined
        ? toNum(r.progressPercent ?? r.progress_percent)
        : totalTests > 0
        ? Math.round((testsCompleted / totalTests) * 100)
        : 0;

    return {
      ...base,
      testSeriesTitle:
        base.testSeriesTitle ||
        toStr(r.title ?? series.title ?? `Series #${base.testSeriesId ?? base.id}`),
      testsCompleted,
      totalTests,
      progressPercent,
      daysRemaining: toNullableNum(r.daysRemaining ?? r.days_remaining),
      isExpired:
        r.isExpired !== undefined
          ? Boolean(r.isExpired)
          : base.status.toUpperCase() === 'EXPIRED',
      paymentAmount: toNullableNum(r.paymentAmount ?? r.amount ?? series.price),
    };
  });

  const s = asRecord(unwrapped.summary);
  let activeCount = 0;
  let expiredCount = 0;
  let cancelledCount = 0;
  let pendingCount = 0;
  for (const e of enrollments) {
    const st = e.status.toUpperCase();
    if (st === 'ACTIVE') activeCount += 1;
    else if (st === 'EXPIRED') expiredCount += 1;
    else if (st === 'CANCELLED' || st === 'REVOKED') cancelledCount += 1;
    else if (st === 'PENDING') pendingCount += 1;
  }

  return {
    summary: {
      totalEnrolled: toNum(s.totalEnrolled ?? s.total ?? s.totalSeries, enrollments.length),
      activeCount: toNum(s.activeCount ?? s.active, activeCount),
      expiredCount: toNum(s.expiredCount ?? s.expired, expiredCount),
      cancelledCount: toNum(s.cancelledCount ?? s.cancelled, cancelledCount),
      pendingCount: toNum(s.pendingCount ?? s.pending, pendingCount),
    },
    enrollments,
  };
}

export function normalizeUserPayments(raw: unknown): UserPaymentListResponse {
  const unwrapped = asRecord(unwrapData(raw));
  const payments: Payment[] = extractArray(raw, [
    'payments',
    'transactions',
    'items',
    'rows',
  ]).map(normalizePayment);

  const pagination = normalizePagination(raw, payments.length, 1, 10);
  const s = asRecord(unwrapped.summary);

  let totalPaidAmount = 0;
  let successfulCount = 0;
  let pendingCount = 0;
  let failedCount = 0;
  let refundedCount = 0;
  let refundedAmount = 0;

  for (const p of payments) {
    const st = p.status.toUpperCase();
    if (st === 'SUCCESS' || st === 'PAID') {
      successfulCount += 1;
      totalPaidAmount += p.amount;
    } else if (st === 'PENDING') {
      pendingCount += 1;
    } else if (st === 'FAILED') {
      failedCount += 1;
    } else if (st === 'REFUNDED') {
      refundedCount += 1;
      refundedAmount += p.refundAmount ?? p.amount;
    }
  }

  return {
    payments,
    pagination,
    summary: {
      totalPaidAmount: toNum(s.totalPaidAmount ?? s.totalPaid ?? s.totalSpent, totalPaidAmount),
      totalPayments: toNum(s.totalPayments ?? s.total, pagination.total || payments.length),
      successfulCount: toNum(s.successfulCount ?? s.successful, successfulCount),
      pendingCount: toNum(s.pendingCount ?? s.pending, pendingCount),
      failedCount: toNum(s.failedCount ?? s.failed, failedCount),
      refundedCount: toNum(s.refundedCount ?? s.refunded, refundedCount),
      refundedAmount: toNum(s.refundedAmount, refundedAmount),
    },
  };
}

export function normalizeUserPaymentDetail(raw: unknown): Payment {
  const unwrapped = asRecord(unwrapData(raw));
  const record = unwrapped.payment ?? unwrapped;
  return normalizePayment(record);
}

export function normalizeUserActivity(raw: unknown): UserActivityResponse {
  const unwrapped = asRecord(unwrapData(raw));
  const rawOuter = asRecord(raw);

  let rawActivities: unknown[] = [];
  if (Array.isArray(raw)) {
    rawActivities = raw;
  } else if (Array.isArray(unwrapData(raw))) {
    rawActivities = unwrapData<unknown[]>(raw);
  } else {
    for (const key of ['activities', 'activity', 'logs', 'timeline', 'events', 'items', 'rows']) {
      if (Array.isArray(unwrapped[key])) {
        rawActivities = unwrapped[key] as unknown[];
        break;
      }
      if (Array.isArray(rawOuter[key])) {
        rawActivities = rawOuter[key] as unknown[];
        break;
      }
    }
  }

  const activities: UserActivityItem[] = rawActivities.map((item, idx) => {
    const r = asRecord(item);
    return {
      id: (r.id ?? idx + 1) as string | number,
      type: toStr(r.type ?? r.activity_type ?? r.activityType ?? r.action ?? 'ACTIVITY'),
      category: r.category ? toStr(r.category) : undefined,
      action: r.action ? toStr(r.action) : undefined,
      description: toStr(
        r.description ?? r.details ?? r.message ?? (r.test_id ? `Test #${r.test_id}` : '')
      ),
      ipAddress: r.ipAddress ?? r.ip_address ?? r.ip ? toStr(r.ipAddress ?? r.ip_address ?? r.ip) : null,
      userAgent: r.userAgent ?? r.user_agent ? toStr(r.userAgent ?? r.user_agent) : null,
      testId: (r.testId ?? r.test_id ?? null) as string | number | null,
      metadata:
        r.metadata && typeof r.metadata === 'object' && !Array.isArray(r.metadata)
          ? (r.metadata as Record<string, unknown>)
          : null,
      createdAt: toStr(r.createdAt ?? r.created_at ?? r.timestamp ?? ''),
    };
  });

  const rawLogins = Array.isArray(unwrapped.loginHistory)
    ? unwrapped.loginHistory
    : Array.isArray(unwrapped.login_history)
    ? unwrapped.login_history
    : Array.isArray(unwrapped.logins)
    ? unwrapped.logins
    : [];

  const loginHistory: UserLoginHistoryItem[] = rawLogins.map((item, idx) => {
    const r = asRecord(item);
    return {
      id: (r.id ?? idx + 1) as string | number,
      ipAddress: r.ipAddress ?? r.ip_address ?? r.ip ? toStr(r.ipAddress ?? r.ip_address ?? r.ip) : null,
      userAgent: r.userAgent ?? r.user_agent ?? r.browser ? toStr(r.userAgent ?? r.user_agent ?? r.browser) : null,
      device: r.device ? toStr(r.device) : null,
      location: r.location ? toStr(r.location) : null,
      status: r.status ? toStr(r.status) : 'SUCCESS',
      loginAt: toStr(r.loginAt ?? r.login_at ?? r.createdAt ?? r.created_at ?? r.timestamp ?? ''),
    };
  });

  const s = asRecord(unwrapped.summary);
  const pagination = normalizePagination(raw, activities.length, 1, 20);

  return {
    activities,
    loginHistory,
    summary: {
      totalEvents: toNum(s.totalEvents ?? s.total, activities.length),
      totalLogins: toNum(s.totalLogins ?? s.loginCount, loginHistory.length),
      lastLoginAt:
        s.lastLoginAt || s.last_login_at
          ? toStr(s.lastLoginAt ?? s.last_login_at)
          : loginHistory[0]?.loginAt ?? null,
      lastActiveAt:
        s.lastActiveAt || s.last_active_at
          ? toStr(s.lastActiveAt ?? s.last_active_at)
          : activities[0]?.createdAt ?? null,
    },
    pagination,
  };
}

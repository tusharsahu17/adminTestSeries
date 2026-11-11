'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  History,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Target,
  UserCheck,
} from 'lucide-react';
import AdminModal from '../../../../components/admin/AdminModal';
import { StatCard } from '../../../../components/admin/DashboardStats';
import UserActivityTab from '../../../../components/admin/users/UserActivityTab';
import UserAnalyticsTab from '../../../../components/admin/users/UserAnalyticsTab';
import UserPaymentsTab from '../../../../components/admin/users/UserPaymentsTab';
import UserTestHistoryTab from '../../../../components/admin/users/UserTestHistoryTab';
import UserTestSeriesTab from '../../../../components/admin/users/UserTestSeriesTab';
import { adminService } from '../../../../services/adminService';
import type {
  UserActivityItem,
  UserProfileOverview,
  UserSubscriptionStatus,
  UserTestAttempt,
} from '../../../../types/admin/user';
import {
  formatCompactNumber,
  formatDate,
  formatDateTime,
  formatDurationSeconds,
  formatINR,
  formatPercent,
  getErrorMessage,
  getStatusBadgeClasses,
} from '../../../../utils/formatters';

type UserTab =
  | 'overview'
  | 'analytics'
  | 'test-history'
  | 'test-series'
  | 'payments'
  | 'activity';

const TABS: Array<{ id: UserTab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <UserCheck className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'test-history', label: 'Test History', icon: <History className="w-4 h-4" /> },
  { id: 'test-series', label: 'Test Series', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'activity', label: 'Activity & Logins', icon: <Activity className="w-4 h-4" /> },
];

const MIN_PASSWORD_LENGTH = 6;

function UserDetailsContent() {
  const params = useParams<{ id: string }>();
  const userId = String(params?.id ?? '');
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTabParam = (searchParams.get('tab') as UserTab) || 'overview';

  const [activeTab, setActiveTab] = useState<UserTab>(
    TABS.some((t) => t.id === initialTabParam) ? initialTabParam : 'overview'
  );

  const [overview, setOverview] = useState<UserProfileOverview | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<UserTestAttempt[]>([]);
  const [recentActivity, setRecentActivity] = useState<UserActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Modals & forms
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', username: '', email: '', phone: '' });

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('active');
  const [statusReason, setStatusReason] = useState('');

  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [targetSubscription, setTargetSubscription] = useState<UserSubscriptionStatus>('active');

  const [submitting, setSubmitting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<'json' | 'csv' | null>(null);

  const loadOverviewData = useCallback(async () => {
    const [overviewRes, historyRes, activityRes] = await Promise.all([
      adminService.getUserOverview(userId),
      adminService
        .getUserTestHistory(userId, { page: 1, limit: 5 })
        .catch(() => ({ attempts: [] as UserTestAttempt[] })),
      adminService
        .getUserActivityLogs(userId, { page: 1, limit: 6 })
        .catch(() => ({ activities: [] as UserActivityItem[] })),
    ]);
    return { overviewRes, historyRes, activityRes };
  }, [userId]);

  const applyOverviewResult = useCallback(
    (res: Awaited<ReturnType<typeof loadOverviewData>>) => {
      const { overviewRes, historyRes, activityRes } = res;
      setOverview(overviewRes);
      setEditForm({
        name: overviewRes.user.name || '',
        username: overviewRes.user.username || '',
        email: overviewRes.user.email || '',
        phone: overviewRes.user.phone || '',
      });
      setTargetStatus((overviewRes.user.status || 'active').toLowerCase());
      setTargetSubscription(
        (overviewRes.user.subscriptionStatus || 'free').toLowerCase()
      );
      setRecentAttempts(historyRes.attempts || []);
      setRecentActivity(activityRes.activities || []);
    },
    []
  );

  const fetchOverview = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await loadOverviewData();
      applyOverviewResult(res);
    } catch (err) {
      console.error('Failed to fetch user overview:', err);
      setError(getErrorMessage(err, 'Failed to load student profile.'));
    } finally {
      setLoading(false);
    }
  }, [userId, loadOverviewData, applyOverviewResult]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    loadOverviewData()
      .then((res) => {
        if (!active) return;
        applyOverviewResult(res);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to fetch user overview:', err);
        setError(getErrorMessage(err, 'Failed to load student profile.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, loadOverviewData, applyOverviewResult]);

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await adminService.updateUserDetails(userId, {
        name: editForm.name.trim(),
        username: editForm.username.trim() || undefined,
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
      });
      setIsEditOpen(false);
      setActionMessage('Student profile updated successfully.');
      await fetchOverview();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update student profile.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.resetUserPassword(userId, {
        newPassword,
        confirmPassword,
      });
      setIsResetOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setActionMessage('Password reset successfully.');
    } catch (err) {
      setPasswordError(getErrorMessage(err, 'Failed to reset password.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await adminService.updateUserStatus(userId, {
        status: targetStatus,
        reason: statusReason.trim() || undefined,
      });
      setIsStatusOpen(false);
      setStatusReason('');
      setActionMessage(`Account status updated to "${targetStatus}".`);
      await fetchOverview();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update account status.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await adminService.updateUserSubscription(userId, {
        subscriptionStatus: targetSubscription,
      });
      setIsSubscriptionOpen(false);
      setActionMessage(`Subscription status updated to "${targetSubscription}".`);
      await fetchOverview();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update subscription status.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportReport = async (format: 'json' | 'csv') => {
    setExportingFormat(format);
    setError(null);
    try {
      const { filename } = await adminService.exportUserReport(userId, format);
      setActionMessage(`Exported student report (${filename}).`);
    } catch (err) {
      setError(getErrorMessage(err, `Failed to export ${format.toUpperCase()} report.`));
    } finally {
      setExportingFormat(null);
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex flex-col h-full min-h-[420px] items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-gray-500">Loading student profile overview...</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[420px] space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-semibold text-gray-900">Student Not Found</h2>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="button"
          onClick={() => router.push('/admin/users')}
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          ← Back to Users
        </button>
      </div>
    );
  }

  const { user, engagement, quickStats } = overview;
  const displayName = user.name || user.username || `User #${user.id}`;
  const currentStatus = (user.status || 'active').toLowerCase();
  const currentSub = (user.subscriptionStatus || 'free').toLowerCase();

  return (
    <div className="flex flex-col space-y-5 pb-10">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
            title="Back to Users"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${getStatusBadgeClasses(
                  currentStatus
                )}`}
              >
                {currentStatus}
              </span>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${getStatusBadgeClasses(
                  currentSub
                )}`}
              >
                {currentSub === 'active' ? 'Pro Plan' : currentSub === 'inactive' ? 'Sub Inactive' : 'Free Plan'}
              </span>
              {engagement.status && (
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${getStatusBadgeClasses(
                    engagement.status
                  )}`}
                >
                  Engagement: {engagement.label || engagement.status.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ID: {user.id}
              {user.username ? ` · @${user.username}` : ''}
              {user.email ? ` · ${user.email}` : ''}
              {' · Joined '}
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleExportReport('csv')}
            disabled={exportingFormat !== null}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg disabled:opacity-50"
          >
            {exportingFormat === 'csv' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => handleExportReport('json')}
            disabled={exportingFormat !== null}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg disabled:opacity-50"
          >
            {exportingFormat === 'json' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            Export JSON
          </button>

          <button
            type="button"
            onClick={() => {
              setTargetSubscription(currentSub);
              setIsSubscriptionOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg"
          >
            <Crown className="w-3.5 h-3.5" />
            Subscription
          </button>

          <button
            type="button"
            onClick={() => {
              setTargetStatus(currentStatus);
              setIsStatusOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg"
          >
            {currentStatus === 'blocked' ? (
              <ShieldAlert className="w-3.5 h-3.5" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            Status
          </button>

          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>

          <button
            type="button"
            onClick={fetchOverview}
            disabled={loading}
            className="p-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg"
            title="Refresh Overview"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Banners */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="font-semibold text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="font-semibold text-rose-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="bg-white rounded-xl border border-gray-200/80 p-1.5 shadow-xs flex flex-wrap gap-1">
        {TABS.map((tab) => {
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isCurrent
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Test Attempts"
              value={formatCompactNumber(quickStats.totalAttempts)}
              subtitle={`${formatCompactNumber(quickStats.completedAttempts)} completed · ${formatCompactNumber(
                quickStats.ongoingAttempts
              )} ongoing`}
              icon={<Target className="w-5 h-5" />}
              accentClass="bg-indigo-50 text-indigo-600"
            />
            <StatCard
              title="Avg Score & Accuracy"
              value={Number(quickStats.averageScore).toFixed(2)}
              subtitle={`Accuracy: ${formatPercent(quickStats.averageAccuracy)} · Best: ${Number(
                quickStats.bestScore
              ).toFixed(1)}`}
              icon={<Award className="w-5 h-5" />}
              accentClass="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="Enrolled Series"
              value={formatCompactNumber(quickStats.enrolledSeriesCount)}
              subtitle={`${formatCompactNumber(quickStats.activeSeriesCount)} active subscriptions`}
              icon={<BookOpen className="w-5 h-5" />}
              accentClass="bg-violet-50 text-violet-600"
            />
            <StatCard
              title="Total Spent"
              value={formatINR(quickStats.totalSpent)}
              subtitle={`${formatCompactNumber(quickStats.totalPaymentsCount)} payments${
                quickStats.rank ? ` · Rank #${quickStats.rank}` : ''
              }`}
              icon={<CreditCard className="w-5 h-5" />}
              accentClass="bg-blue-50 text-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Profile & Engagement Card */}
            <div className="lg:col-span-1 space-y-5">
              <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-6">
                <div className="flex flex-col items-center text-center pb-5 border-b border-gray-100">
                  <div className="w-18 h-18 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold mb-3">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{displayName}</h2>
                  <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
                </div>

                <div className="pt-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
                      Contact & Account Info
                    </h3>
                    <div className="text-xs space-y-2 text-gray-600">
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Username</span>
                        <span className="font-semibold text-gray-900">{user.username || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Phone</span>
                        <span className="font-semibold text-gray-900">{user.phone || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Role</span>
                        <span className="font-semibold text-gray-900 capitalize">
                          {user.role || 'student'}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Last Login</span>
                        <span className="font-semibold text-gray-900">
                          {formatDateTime(engagement.lastLoginAt || user.lastLoginAt)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Last Active</span>
                        <span className="font-semibold text-gray-900">
                          {formatDateTime(engagement.lastActiveAt || user.lastActiveAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
                      Engagement Snapshot
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-gray-500 block">Tests (7d / 30d)</span>
                        <span className="font-bold text-gray-900">
                          {engagement.testsLast7Days} / {engagement.testsLast30Days}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-gray-500 block">Streak / Logins</span>
                        <span className="font-bold text-gray-900">
                          {engagement.streakDays}d / {engagement.loginCount}
                        </span>
                      </div>
                    </div>
                    {engagement.daysSinceLastActive !== null && (
                      <p className="text-[11px] text-gray-500 mt-2">
                        Days since last activity: <strong>{engagement.daysSinceLastActive}</strong>
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditOpen(true)}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Edit Student Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordError(null);
                        setNewPassword('');
                        setConfirmPassword('');
                        setIsResetOpen(true);
                      }}
                      className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      Reset Password
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Recent Attempts & Activity Previews */}
            <div className="lg:col-span-2 space-y-5">
              {/* Recent Attempts */}
              <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Recent Test Attempts</h3>
                    <p className="text-xs text-gray-500">Latest 5 recorded attempts</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('test-history')}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Full Test History →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/70 text-gray-500">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">Test</th>
                        <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">Date</th>
                        <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">Time</th>
                        <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">Score</th>
                        <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-right">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentAttempts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            No tests attempted yet.
                          </td>
                        </tr>
                      ) : (
                        recentAttempts.map((att) => (
                          <tr key={String(att.attemptId || att.id)} className="hover:bg-gray-50/50">
                            <td className="py-3 px-4 font-medium text-gray-900">
                              <div>{att.testTitle}</div>
                              {att.testSeriesTitle && (
                                <div className="text-[11px] text-gray-500">
                                  Series: {att.testSeriesTitle}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {formatDateTime(att.submittedAt || att.createdAt || att.startedAt)}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {att.timeTakenSeconds > 0
                                ? formatDurationSeconds(att.timeTakenSeconds)
                                : '—'}
                            </td>
                            <td className="py-3 px-4 font-semibold text-gray-800">
                              {Number(att.score).toFixed(1)}/{att.totalMarks} ({formatPercent(att.percentage)})
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span
                                className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${getStatusBadgeClasses(
                                  att.status
                                )}`}
                              >
                                {att.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Recent Activity</h3>
                    <p className="text-xs text-gray-500">Latest logged actions</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('activity')}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    View Activity & Logins →
                  </button>
                </div>
                {recentActivity.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500">
                    No recorded activity events yet.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {recentActivity.map((act) => (
                      <div
                        key={String(act.id)}
                        className="px-4 py-3 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 shrink-0">
                            {act.type}
                          </span>
                          <span className="text-gray-700">{act.description || '—'}</span>
                        </div>
                        <span className="text-gray-500 shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(act.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && <UserAnalyticsTab userId={userId} />}

      {activeTab === 'test-history' && <UserTestHistoryTab userId={userId} />}

      {activeTab === 'test-series' && (
        <UserTestSeriesTab userId={userId} onDataChange={fetchOverview} />
      )}

      {activeTab === 'payments' && <UserPaymentsTab userId={userId} />}

      {activeTab === 'activity' && <UserActivityTab userId={userId} />}

      {/* Edit Profile Modal */}
      <AdminModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Student Profile"
        subtitle="Update student contact information and username."
      >
        <form onSubmit={handleUpdateDetails} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Secure Reset Password Modal */}
      <AdminModal
        open={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="Reset Student Password"
        subtitle={`Minimum ${MIN_PASSWORD_LENGTH} characters with confirmation required.`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          {passwordError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={MIN_PASSWORD_LENGTH}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError(null);
                }}
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError(null);
              }}
              placeholder="Re-enter new password"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {confirmPassword.length > 0 && confirmPassword !== newPassword && (
              <p className="text-[11px] text-rose-600 mt-1">Passwords do not match.</p>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsResetOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Reset Password
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Account Status Modal */}
      <AdminModal
        open={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        title="Update Account Status"
        subtitle="Activate, deactivate, block, or unblock student login access."
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Account Status
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
            >
              <option value="active">Active (Full access)</option>
              <option value="inactive">Inactive (Disabled)</option>
              <option value="blocked">Blocked (Restricted)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              rows={2}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Optional note for audit trail..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsStatusOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Status
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Subscription Status Toggle Modal */}
      <AdminModal
        open={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        title="Update Subscription Status"
        subtitle="Toggle student plan tier between active, inactive, and free."
      >
        <form onSubmit={handleUpdateSubscription} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(['active', 'inactive', 'free'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setTargetSubscription(tier)}
                className={`py-2.5 px-3 rounded-lg border text-xs font-semibold capitalize transition-colors ${
                  targetSubscription === tier
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsSubscriptionOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Subscription
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

export default function UserDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[420px]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <UserDetailsContent />
    </Suspense>
  );
}

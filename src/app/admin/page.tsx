'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Clock,
  CreditCard,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import AnalyticsChart from '../../components/admin/AnalyticsChart';
import DashboardStats from '../../components/admin/DashboardStats';
import SeriesPerformancePanel from '../../components/admin/SeriesPerformancePanel';
import { adminService } from '../../services/adminService';
import { FullDashboardData } from '../../types/admin/analytics';
import {
  formatCompactNumber,
  formatDate,
  formatDurationSeconds,
  formatINR,
  formatPercent,
  getErrorMessage,
} from '../../utils/formatters';

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<FullDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [testDays, setTestDays] = useState(7);
  const [revenueMonths, setRevenueMonths] = useState(6);
  const [seriesLimit, setSeriesLimit] = useState(5);

  const loadDashboardData = useCallback(async () => {
    const data = await adminService.getFullDashboard({
      studentDays: 30,
      weeks: 12,
      studentMonths: 12,
      testDays,
      revenueMonths,
      seriesLimit,
    });
    return data;
  }, [testDays, revenueMonths, seriesLimit]);

  const handleRefresh = useCallback(
    async (isRefresh = true) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const data = await loadDashboardData();
        setDashboard(data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(getErrorMessage(err, 'Unable to load dashboard analytics from API.'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loadDashboardData]
  );

  useEffect(() => {
    let active = true;
    loadDashboardData()
      .then((data) => {
        if (!active) return;
        setDashboard(data);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to fetch dashboard data:', err);
        setError(getErrorMessage(err, 'Unable to load dashboard analytics from API.'));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      });
    return () => {
      active = false;
    };
  }, [loadDashboardData]);

  if (loading && !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-gray-500">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">
            Live overview of students, tests, test series performance, revenue, and learning outcomes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={testDays}
            onChange={(e) => {
              setRefreshing(true);
              setTestDays(Number(e.target.value));
            }}
            aria-label="Test attempts range"
            className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-700"
          >
            <option value={7}>Attempts: Last 7 days</option>
            <option value={14}>Attempts: Last 14 days</option>
            <option value={30}>Attempts: Last 30 days</option>
          </select>

          <select
            value={revenueMonths}
            onChange={(e) => {
              setRefreshing(true);
              setRevenueMonths(Number(e.target.value));
            }}
            aria-label="Revenue months range"
            className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-700"
          >
            <option value={6}>Revenue: 6 months</option>
            <option value={12}>Revenue: 12 months</option>
          </select>

          <select
            value={seriesLimit}
            onChange={(e) => {
              setRefreshing(true);
              setSeriesLimit(Number(e.target.value));
            }}
            aria-label="Top series limit"
            className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-700"
          >
            <option value={5}>Top 5 Series</option>
            <option value={10}>Top 10 Series</option>
          </select>

          <button
            type="button"
            onClick={() => handleRefresh(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Deep Analytics
          </Link>
        </div>
      </header>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => handleRefresh(false)}
            className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-semibold text-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {dashboard && (
        <>
          {/* 1. Overview KPIs */}
          <DashboardStats overview={dashboard.overview} />

          {/* 2. Charts: Attempts Overview & Monthly Revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <AnalyticsChart
              title={`Test Attempts (${testDays}d)`}
              subtitle={`Completion rate ${formatPercent(
                dashboard.testAnalytics.testCompletionRate
              )} · Avg score ${Number(dashboard.testAnalytics.averageTestScore).toFixed(1)} · Avg time ${formatDurationSeconds(
                dashboard.testAnalytics.averageTestCompletionTimeSeconds
              )}`}
              items={dashboard.testAnalytics.attemptsOverview.map((pt) => ({
                label: pt.label,
                value: pt.attempts,
                secondaryValue: pt.completedAttempts,
                tooltip: `${pt.label}: ${pt.attempts} attempts (${pt.completedAttempts} completed, ${pt.ongoingAttempts} ongoing)`,
              }))}
              primaryLabel="Total Attempts"
              secondaryLabel="Completed"
              barColorClass="bg-indigo-500 hover:bg-indigo-600"
              secondaryColorClass="bg-emerald-500"
              headerAction={
                <Link
                  href="/admin/analytics?tab=tests"
                  className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  Details <ArrowRight className="w-3 h-3" />
                </Link>
              }
            />

            <AnalyticsChart
              title={`Monthly Revenue (${revenueMonths}m)`}
              subtitle={`Today: ${formatINR(
                dashboard.revenueAnalytics.revenueToday
              )} · This Month: ${formatINR(
                dashboard.revenueAnalytics.revenueThisMonth
              )} · AOV: ${formatINR(dashboard.revenueAnalytics.averageOrderValue)}`}
              items={dashboard.revenueAnalytics.monthlyRevenue.map((pt) => ({
                label: pt.label,
                value: pt.revenue,
                tooltip: `${pt.label}: ${formatINR(pt.revenue)}${
                  pt.paymentsCount !== undefined ? ` (${pt.paymentsCount} payments)` : ''
                }`,
              }))}
              valueFormatter={(v) => formatINR(v)}
              barColorClass="bg-emerald-500 hover:bg-emerald-600"
              headerAction={
                <Link
                  href="/admin/payments"
                  className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  Payments <ArrowRight className="w-3 h-3" />
                </Link>
              }
            />
          </div>

          {/* 3. Test Series Performance & Highlights */}
          <SeriesPerformancePanel data={dashboard.testSeriesPerformance} compact />

          {/* 4. Student Pulse, Performance & Revenue/Recently Published */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Student Snapshot */}
            <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Student Pulse</h3>
                </div>
                <Link
                  href="/admin/analytics?tab=students"
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">New Today / Week</p>
                  <p className="font-bold text-gray-900 mt-1">
                    {formatCompactNumber(dashboard.studentAnalytics.newRegistrationsToday)} /{' '}
                    {formatCompactNumber(dashboard.studentAnalytics.newRegistrationsThisWeek)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Active Today</p>
                  <p className="font-bold text-emerald-700 mt-1">
                    {formatCompactNumber(dashboard.studentAnalytics.activeStudentsToday)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Paid / Free</p>
                  <p className="font-bold text-gray-900 mt-1">
                    {formatCompactNumber(dashboard.studentAnalytics.paidStudents)} /{' '}
                    {formatCompactNumber(dashboard.studentAnalytics.freeStudents)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Retention Rate</p>
                  <p className="font-bold text-indigo-600 mt-1">
                    {formatPercent(dashboard.studentAnalytics.studentRetentionRate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Student Performance Snapshot */}
            <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Student Performance</h3>
                </div>
                <Link
                  href="/admin/analytics?tab=student-performance"
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Avg / High Score</p>
                  <p className="font-bold text-gray-900 mt-1">
                    {Number(dashboard.studentPerformanceAnalytics.averageStudentScore).toFixed(1)} /{' '}
                    {Number(dashboard.studentPerformanceAnalytics.highestScore).toFixed(1)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Pass % / Accuracy</p>
                  <p className="font-bold text-emerald-700 mt-1">
                    {formatPercent(dashboard.studentPerformanceAnalytics.passPercentage)} /{' '}
                    {formatPercent(dashboard.studentPerformanceAnalytics.averageAccuracy)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Avg Time
                  </p>
                  <p className="font-bold text-gray-900 mt-1">
                    {formatDurationSeconds(
                      dashboard.studentPerformanceAnalytics.averageCompletionTimeSeconds
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Improving / Struggling</p>
                  <p className="font-bold text-gray-900 mt-1">
                    <span className="text-emerald-600">
                      {dashboard.studentPerformanceAnalytics.studentsImproving}
                    </span>{' '}
                    /{' '}
                    <span className="text-rose-600">
                      {dashboard.studentPerformanceAnalytics.studentsStruggling}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Payments & Recently Published Quick Summary */}
            <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Payments & Releases</h3>
                </div>
                <Link
                  href="/admin/enrollments"
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Enrollments →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Successful / Pending</p>
                  <p className="font-bold text-gray-900 mt-1">
                    <span className="text-emerald-600">
                      {dashboard.revenueAnalytics.successfulPayments}
                    </span>{' '}
                    /{' '}
                    <span className="text-amber-600">
                      {dashboard.revenueAnalytics.pendingPayments}
                    </span>
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Refunds / Failed</p>
                  <p className="font-bold text-gray-900 mt-1">
                    <span className="text-purple-600">
                      {dashboard.revenueAnalytics.refundsCount}
                    </span>{' '}
                    /{' '}
                    <span className="text-rose-600">
                      {dashboard.revenueAnalytics.failedPayments}
                    </span>
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Recently Published Series
                </p>
                {dashboard.testSeriesPerformance.recentlyPublishedSeries.length === 0 ? (
                  <p className="text-xs text-gray-400">No published series yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {dashboard.testSeriesPerformance.recentlyPublishedSeries.slice(0, 3).map((s, i) => (
                      <div
                        key={`pub-${s.id ?? s.title}-${i}`}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <span className="font-medium text-gray-800 truncate max-w-[170px]">
                          {s.title}
                        </span>
                        <span className="text-gray-500">
                          {s.publishedAt ? formatDate(s.publishedAt) : 'Published'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

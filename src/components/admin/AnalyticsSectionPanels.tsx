'use client';

import React, { useState } from 'react';
import {
  Activity,
  Award,
  CheckCircle2,
  Clock,
  CreditCard,
  Percent,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import {
  RevenueAnalytics,
  StudentAnalytics,
  StudentPerformanceAnalytics,
  TestAnalytics,
} from '../../types/admin/analytics';
import {
  formatCompactNumber,
  formatDurationSeconds,
  formatINR,
  formatPercent,
} from '../../utils/formatters';
import AnalyticsChart from './AnalyticsChart';
import { StatCard } from './DashboardStats';

export function StudentAnalyticsPanel({
  data,
  controls,
}: {
  data: StudentAnalytics;
  controls?: React.ReactNode;
}) {
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const chartSeries = data.registrationGrowth[granularity] || [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="New Registrations"
          value={formatCompactNumber(data.newRegistrationsToday)}
          subtitle={`Week: ${formatCompactNumber(data.newRegistrationsThisWeek)} · Month: ${formatCompactNumber(data.newRegistrationsThisMonth)}`}
          icon={<UserPlus className="w-5 h-5" />}
          accentClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Active vs Inactive"
          value={formatCompactNumber(data.activeStudentsToday)}
          subtitle={`Active today · ${formatCompactNumber(data.inactiveStudents)} inactive`}
          icon={<UserCheck className="w-5 h-5" />}
          accentClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Paid vs Free Students"
          value={formatCompactNumber(data.paidStudents)}
          subtitle={`Paid · ${formatCompactNumber(data.freeStudents)} free accounts`}
          icon={<Users className="w-5 h-5" />}
          accentClass="bg-violet-50 text-violet-600"
        />
        <StatCard
          title="Retention & Engagement"
          value={formatPercent(data.studentRetentionRate)}
          subtitle={`Avg ${Number(data.averageTestsAttemptedPerStudent).toFixed(2)} tests / student`}
          icon={<Activity className="w-5 h-5" />}
          accentClass="bg-blue-50 text-blue-600"
        />
      </div>

      <AnalyticsChart
        title="Student Registration Growth"
        subtitle={`Zero-filled ${granularity} registration trend`}
        items={chartSeries.map((pt) => ({
          label: pt.label,
          value: pt.count,
        }))}
        barColorClass="bg-indigo-500 hover:bg-indigo-600"
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            {controls}
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs">
              {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setGranularity(tab)}
                  className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                    granularity === tab
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        }
      />
    </div>
  );
}

export function TestAnalyticsPanel({
  data,
  controls,
}: {
  data: TestAnalytics;
  controls?: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tests Created"
          value={formatCompactNumber(data.totalTestsCreated)}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentClass="bg-indigo-50 text-indigo-600"
          badges={[
            { label: 'Published', value: data.publishedTests, className: 'bg-emerald-50 text-emerald-700' },
            { label: 'Draft', value: data.draftTests, className: 'bg-gray-100 text-gray-700' },
            { label: 'Scheduled', value: data.scheduledTests, className: 'bg-amber-50 text-amber-700' },
          ]}
        />
        <StatCard
          title="Attempts Breakdown"
          value={formatCompactNumber(data.completedAttempts)}
          subtitle={`Completed · ${formatCompactNumber(data.ongoingAttempts)} ongoing`}
          icon={<Activity className="w-5 h-5" />}
          accentClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Completion Rate"
          value={formatPercent(data.testCompletionRate)}
          subtitle={`Avg Score: ${Number(data.averageTestScore).toFixed(2)}`}
          icon={<Percent className="w-5 h-5" />}
          accentClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Avg Completion Time"
          value={formatDurationSeconds(data.averageTestCompletionTimeSeconds)}
          subtitle={`${Number(data.averageTestCompletionTimeMinutes).toFixed(1)} mins (${Math.round(
            data.averageTestCompletionTimeSeconds
          )}s)`}
          icon={<Clock className="w-5 h-5" />}
          accentClass="bg-amber-50 text-amber-600"
        />
      </div>

      <AnalyticsChart
        title="Test Attempts Overview"
        subtitle="Zero-filled daily attempts vs completed attempts"
        items={data.attemptsOverview.map((pt) => ({
          label: pt.label,
          value: pt.attempts,
          secondaryValue: pt.completedAttempts,
          tooltip: `${pt.label}: ${pt.attempts} attempts (${pt.completedAttempts} completed, ${pt.ongoingAttempts} ongoing)`,
        }))}
        primaryLabel="Total Attempts"
        secondaryLabel="Completed"
        barColorClass="bg-indigo-500 hover:bg-indigo-600"
        secondaryColorClass="bg-emerald-500"
        headerAction={controls}
      />
    </div>
  );
}

export function RevenueAnalyticsPanel({
  data,
  controls,
}: {
  data: RevenueAnalytics;
  controls?: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatINR(data.totalRevenue)}
          subtitle={`Today: ${formatINR(data.revenueToday)} · This Month: ${formatINR(
            data.revenueThisMonth
          )}`}
          icon={<CreditCard className="w-5 h-5" />}
          accentClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Payment Outcomes"
          value={formatCompactNumber(data.successfulPayments)}
          subtitle="Successful payments"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentClass="bg-blue-50 text-blue-600"
          badges={[
            { label: 'Pending', value: data.pendingPayments, className: 'bg-amber-50 text-amber-700' },
            { label: 'Failed', value: data.failedPayments, className: 'bg-rose-50 text-rose-700' },
          ]}
        />
        <StatCard
          title="Refunds"
          value={formatINR(data.refundsAmount)}
          subtitle={`${formatCompactNumber(data.refundsCount)} refunded orders`}
          icon={<RefreshCcw className="w-5 h-5" />}
          accentClass="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Subscriptions & AOV"
          value={formatINR(data.averageOrderValue)}
          subtitle={`Avg order value · ${formatCompactNumber(
            data.totalPaidSubscriptions
          )} paid subscriptions`}
          icon={<Award className="w-5 h-5" />}
          accentClass="bg-indigo-50 text-indigo-600"
        />
      </div>

      <AnalyticsChart
        title="Monthly Revenue (INR)"
        subtitle="Zero-filled monthly revenue trend"
        items={data.monthlyRevenue.map((pt) => ({
          label: pt.label,
          value: pt.revenue,
          tooltip: `${pt.label}: ${formatINR(pt.revenue)}${
            pt.paymentsCount !== undefined ? ` (${pt.paymentsCount} payments)` : ''
          }`,
        }))}
        valueFormatter={(v) => formatINR(v)}
        barColorClass="bg-emerald-500 hover:bg-emerald-600"
        headerAction={controls}
      />
    </div>
  );
}

export function StudentPerformancePanel({ data }: { data: StudentPerformanceAnalytics }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Score"
          value={Number(data.averageStudentScore).toFixed(2)}
          subtitle={`High: ${Number(data.highestScore).toFixed(1)} · Low: ${Number(
            data.lowestScore
          ).toFixed(1)}`}
          icon={<Award className="w-5 h-5" />}
          accentClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Accuracy & Pass Rate"
          value={formatPercent(data.passPercentage)}
          subtitle={`Pass rate · Avg accuracy ${formatPercent(data.averageAccuracy)}`}
          icon={<Percent className="w-5 h-5" />}
          accentClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Avg Completion Time"
          value={formatDurationSeconds(data.averageCompletionTimeSeconds)}
          subtitle={`${Number(data.averageCompletionTimeMinutes).toFixed(1)} mins average`}
          icon={<Clock className="w-5 h-5" />}
          accentClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Student Trajectory"
          value={`${formatCompactNumber(data.studentsImproving)} Improving`}
          subtitle={`${formatCompactNumber(data.studentsStruggling)} struggling`}
          icon={
            data.studentsImproving >= data.studentsStruggling ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )
          }
          accentClass="bg-blue-50 text-blue-600"
          badges={[
            { label: 'Improving', value: data.studentsImproving, className: 'bg-emerald-50 text-emerald-700' },
            { label: 'Struggling', value: data.studentsStruggling, className: 'bg-rose-50 text-rose-700' },
          ]}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Subject-wise Performance</h3>
          <p className="text-xs text-gray-500">
            Score, accuracy, and pass percentage across subjects
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70">
                <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Subject
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">
                  Attempts
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">
                  Avg Score
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Avg Accuracy
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Pass Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {data.subjectWisePerformance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-1">
                      <XCircle className="w-5 h-5 text-gray-300" />
                      <span>No subject-wise performance records yet.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.subjectWisePerformance.map((subj, idx) => (
                  <tr key={`${subj.subjectId ?? subj.subjectName}-${idx}`} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-semibold text-gray-900">{subj.subjectName}</td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {formatCompactNumber(subj.attempts)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {Number(subj.averageScore).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, subj.averageAccuracy))}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {formatPercent(subj.averageAccuracy)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, subj.passPercentage))}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-emerald-700">
                          {formatPercent(subj.passPercentage)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


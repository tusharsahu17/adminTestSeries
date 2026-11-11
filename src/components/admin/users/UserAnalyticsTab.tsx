'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Loader2,
  Percent,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { adminService } from '../../../services/adminService';
import type { UserAnalytics } from '../../../types/admin/user';
import {
  formatCompactNumber,
  formatDurationSeconds,
  formatPercent,
  getErrorMessage,
  getStatusBadgeClasses,
} from '../../../utils/formatters';
import AnalyticsChart from '../AnalyticsChart';
import { StatCard } from '../DashboardStats';

interface UserAnalyticsTabProps {
  userId: string;
}

export default function UserAnalyticsTab({ userId }: UserAnalyticsTabProps) {
  const [data, setData] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    return await adminService.getUserAnalytics(userId);
  }, [userId]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAnalyticsData();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch user analytics:', err);
      setError(getErrorMessage(err, 'Failed to load student analytics.'));
    } finally {
      setLoading(false);
    }
  }, [fetchAnalyticsData]);

  useEffect(() => {
    let active = true;
    fetchAnalyticsData()
      .then((res) => {
        if (!active) return;
        setData(res);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to fetch user analytics:', err);
        setError(getErrorMessage(err, 'Failed to load student analytics.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchAnalyticsData]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 py-16 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
        <p className="text-xs text-gray-500">Loading performance analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
        <button
          type="button"
          onClick={loadAnalytics}
          className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-semibold text-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, improvementTracker, trend, subjectWiseBreakdown, weakSubjects } = data;
  const isImproving = improvementTracker.direction === 'improving' || improvementTracker.scoreDelta > 0;
  const isDeclining = improvementTracker.direction === 'declining' || improvementTracker.scoreDelta < 0;

  return (
    <div className="space-y-5">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">Student Performance Analytics</h3>
          <p className="text-xs text-gray-500">
            Score metrics, subject-wise breakdown, score trend, improvement tracker, and weak areas.
          </p>
        </div>
        <button
          type="button"
          onClick={loadAnalytics}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Average Score"
          value={Number(metrics.averageScore).toFixed(2)}
          subtitle={`High: ${Number(metrics.highestScore).toFixed(1)} · Low: ${Number(metrics.lowestScore).toFixed(1)}`}
          icon={<Award className="w-5 h-5" />}
          accentClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Accuracy & Pass Rate"
          value={formatPercent(metrics.averageAccuracy)}
          subtitle={`Pass rate: ${formatPercent(metrics.passRate)} · Best: ${formatPercent(metrics.bestPercentage)}`}
          icon={<Percent className="w-5 h-5" />}
          accentClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Avg Completion Time"
          value={formatDurationSeconds(metrics.averageTimeSeconds)}
          subtitle={`Total study time: ${formatDurationSeconds(metrics.totalTimeSpentSeconds)}`}
          icon={<Clock className="w-5 h-5" />}
          accentClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Attempts & Rank"
          value={formatCompactNumber(metrics.completedAttempts)}
          subtitle={`Completed of ${formatCompactNumber(metrics.totalAttempts)} attempts${
            metrics.currentRank ? ` · Rank #${metrics.currentRank}` : ''
          }`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentClass="bg-blue-50 text-blue-600"
        />
      </div>

      {/* Improvement Tracker + Weak Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-gray-900">Improvement Tracker</h4>
              <p className="text-xs text-gray-500">
                Comparison between early attempts and recent test performance
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadgeClasses(
                improvementTracker.status || improvementTracker.direction
              )}`}
            >
              {isImproving ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : isDeclining ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : null}
              {improvementTracker.status || improvementTracker.direction || 'Stable'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Score Trajectory
              </p>
              <p
                className={`text-lg font-bold mt-1 ${
                  improvementTracker.scoreDelta > 0
                    ? 'text-emerald-600'
                    : improvementTracker.scoreDelta < 0
                    ? 'text-rose-600'
                    : 'text-gray-800'
                }`}
              >
                {improvementTracker.scoreDelta > 0 ? '+' : ''}
                {Number(improvementTracker.scoreDelta).toFixed(2)} pts
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Early: {Number(improvementTracker.earlyAverageScore).toFixed(1)} → Recent:{' '}
                {Number(improvementTracker.recentAverageScore).toFixed(1)}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Accuracy Shift
              </p>
              <p
                className={`text-lg font-bold mt-1 ${
                  improvementTracker.accuracyDelta > 0
                    ? 'text-emerald-600'
                    : improvementTracker.accuracyDelta < 0
                    ? 'text-rose-600'
                    : 'text-gray-800'
                }`}
              >
                {improvementTracker.accuracyDelta > 0 ? '+' : ''}
                {formatPercent(improvementTracker.accuracyDelta)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Early: {formatPercent(improvementTracker.earlyAccuracy)} → Recent:{' '}
                {formatPercent(improvementTracker.recentAccuracy)}
              </p>
            </div>
          </div>

          {improvementTracker.summaryText && (
            <p className="text-xs text-gray-600 bg-indigo-50/70 border border-indigo-100 rounded-lg px-3 py-2">
              {improvementTracker.summaryText}
            </p>
          )}
        </div>

        {/* Weak Subjects */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Weak Subjects & Focus Areas
              </h4>
              <p className="text-xs text-gray-500">
                Subjects needing additional practice based on accuracy and scores
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {weakSubjects.length} flagged
            </span>
          </div>

          {weakSubjects.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 bg-gray-50/70 rounded-lg border border-dashed border-gray-200">
              No weak subjects flagged yet.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {weakSubjects.map((ws, idx) => (
                <div
                  key={`${ws.subjectId ?? ws.subjectName}-${idx}`}
                  className="p-3 rounded-lg bg-rose-50/60 border border-rose-100 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ws.subjectName}</p>
                    {ws.recommendation && (
                      <p className="text-xs text-gray-600 mt-0.5">{ws.recommendation}</p>
                    )}
                    <p className="text-[11px] text-gray-500 mt-1">
                      {ws.attempts} attempts · Avg score {Number(ws.averageScore).toFixed(1)}
                      {ws.wrongAnswers !== undefined ? ` · ${ws.wrongAnswers} wrong answers` : ''}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 shrink-0">
                    {formatPercent(ws.averageAccuracy)} acc
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trend Chart */}
      <AnalyticsChart
        title="Performance Trend"
        subtitle="Score percentage vs accuracy across recent test attempts"
        items={trend.map((pt) => ({
          label: pt.label,
          value: pt.percentage,
          secondaryValue: pt.accuracy,
          tooltip: `${pt.testTitle || pt.label}: Score ${pt.score}/${pt.totalMarks} (${formatPercent(
            pt.percentage
          )}) · Accuracy ${formatPercent(pt.accuracy)}`,
        }))}
        valueFormatter={(v) => formatPercent(v)}
        primaryLabel="Score %"
        secondaryLabel="Accuracy %"
        barColorClass="bg-indigo-500 hover:bg-indigo-600"
        secondaryColorClass="bg-emerald-400"
        emptyMessage="No completed test attempts available to plot trend."
      />

      {/* Subject-wise Breakdown Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-base font-bold text-gray-900">Subject-wise Breakdown</h4>
          <p className="text-xs text-gray-500">
            Detailed question accuracy, pass rate, and average score by subject
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
                  C / W / S
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">
                  Avg Score
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Accuracy
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Pass Rate
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">
                  Level
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {subjectWiseBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400 text-xs">
                    No subject-wise breakdown available yet.
                  </td>
                </tr>
              ) : (
                subjectWiseBreakdown.map((subj, idx) => {
                  const inferredLevel =
                    subj.strengthLevel ||
                    (subj.averageAccuracy >= 75
                      ? 'STRONG'
                      : subj.averageAccuracy >= 50
                      ? 'AVERAGE'
                      : 'WEAK');

                  return (
                    <tr key={`${subj.subjectId ?? subj.subjectName}-${idx}`} className="hover:bg-gray-50/60">
                      <td className="py-3 px-4 font-semibold text-gray-900">{subj.subjectName}</td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatCompactNumber(subj.attempts)}
                      </td>
                      <td className="py-3 px-4 text-right text-xs font-medium">
                        <span className="text-emerald-700">{subj.correctAnswers}</span>
                        {' / '}
                        <span className="text-rose-600">{subj.wrongAnswers}</span>
                        {' / '}
                        <span className="text-gray-500">{subj.skippedQuestions}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {Number(subj.averageScore).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{
                                width: `${Math.min(100, Math.max(0, subj.averageAccuracy))}%`,
                              }}
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
                              style={{
                                width: `${Math.min(100, Math.max(0, subj.passRate))}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-emerald-700">
                            {formatPercent(subj.passRate)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadgeClasses(
                            inferredLevel
                          )}`}
                        >
                          {inferredLevel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

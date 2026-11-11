'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileSearch,
  Loader2,
  MinusCircle,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { adminService } from '../../../services/adminService';
import type {
  PaginationMeta,
  UserAttemptInspection,
  UserTestAttempt,
} from '../../../types/admin/user';
import {
  formatDateTime,
  formatDurationSeconds,
  formatPercent,
  getErrorMessage,
  getStatusBadgeClasses,
} from '../../../utils/formatters';
import Pagination from '../../ui/Pagination';
import AdminModal from '../AdminModal';

interface UserTestHistoryTabProps {
  userId: string;
}

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

export default function UserTestHistoryTab({ userId }: UserTestHistoryTabProps) {
  const [attempts, setAttempts] = useState<UserTestAttempt[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Attempt Inspection Modal
  const [inspectAttemptId, setInspectAttemptId] = useState<string | number | null>(null);
  const [inspection, setInspection] = useState<UserAttemptInspection | null>(null);
  const [loadingInspection, setLoadingInspection] = useState(false);
  const [inspectionError, setInspectionError] = useState<string | null>(null);
  const [questionFilter, setQuestionFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED'>('ALL');

  const fetchHistoryData = useCallback(async () => {
    return await adminService.getUserTestHistory(userId, {
      page,
      limit: 10,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: statusFilter || undefined,
      search: search.trim() || undefined,
    });
  }, [userId, page, startDate, endDate, statusFilter, search]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchHistoryData();
      setAttempts(res.attempts);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch user test history:', err);
      setError(getErrorMessage(err, 'Failed to load test history.'));
    } finally {
      setLoading(false);
    }
  }, [fetchHistoryData]);

  useEffect(() => {
    let active = true;
    fetchHistoryData()
      .then((res) => {
        if (!active) return;
        setAttempts(res.attempts);
        setPagination(res.pagination);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to fetch user test history:', err);
        setError(getErrorMessage(err, 'Failed to load test history.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchHistoryData]);

  const handleInspectAttempt = async (attempt: UserTestAttempt) => {
    const id = attempt.attemptId || attempt.id;
    setInspectAttemptId(id);
    setInspection(null);
    setInspectionError(null);
    setQuestionFilter('ALL');
    setLoadingInspection(true);
    try {
      const data = await adminService.getUserAttemptDetail(userId, id);
      setInspection(data);
    } catch (err) {
      console.error('Failed to load attempt detail:', err);
      setInspectionError(getErrorMessage(err, 'Failed to inspect attempt details.'));
    } finally {
      setLoadingInspection(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    if (!inspection) return [];
    return inspection.questions.filter((q) => {
      if (questionFilter === 'CORRECT') return q.isCorrect;
      if (questionFilter === 'WRONG') return !q.isCorrect && !q.isSkipped;
      if (questionFilter === 'SKIPPED') return q.isSkipped;
      return true;
    });
  }, [inspection, questionFilter]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Header + Filter Controls */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Test History & Attempts</h3>
              <p className="text-xs text-gray-500">
                Paginated and date-filtered test attempts with question-level inspection.
              </p>
            </div>
            <button
              type="button"
              onClick={loadHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search test title..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter attempt status"
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ABANDONED">Abandoned</option>
            </select>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                aria-label="Start date"
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700"
              />
              <span className="text-gray-500">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                aria-label="End date"
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700"
              />
            </div>

            {(search || statusFilter || startDate || endDate) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="m-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button type="button" onClick={loadHistory} className="font-semibold hover:underline">
              Retry
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70">
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Test & Series
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Time Taken
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  C / W / S
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Score
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Rank / %ile
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">
                  Inspect
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : attempts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 text-xs">
                    No test attempts match the selected filters.
                  </td>
                </tr>
              ) : (
                attempts.map((att) => (
                  <tr key={String(att.attemptId || att.id)} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">{att.testTitle}</p>
                      {att.testSeriesTitle && (
                        <p className="text-xs text-gray-500">{att.testSeriesTitle}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {formatDateTime(att.submittedAt || att.createdAt || att.startedAt)}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-700">
                      {att.timeTakenSeconds > 0 ? formatDurationSeconds(att.timeTakenSeconds) : '—'}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium">
                      <span className="text-emerald-700">{att.correctAnswers}</span>
                      {' / '}
                      <span className="text-rose-600">{att.wrongAnswers}</span>
                      {' / '}
                      <span className="text-gray-500">{att.skippedQuestions}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">
                        {Number(att.score).toFixed(1)} / {att.totalMarks}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {formatPercent(att.percentage)} · {formatPercent(att.accuracy)} acc
                      </p>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-700">
                      {att.rank ? `#${att.rank}` : '—'}
                      {att.percentile !== null && att.percentile !== undefined
                        ? ` (${formatPercent(att.percentile)})`
                        : ''}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadgeClasses(
                          att.status
                        )}`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleInspectAttempt(att)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          itemCount={attempts.length}
          itemLabel="attempts"
          onPageChange={setPage}
          loading={loading}
        />
      </div>

      {/* Full Attempt Inspection Modal */}
      <AdminModal
        open={inspectAttemptId !== null}
        onClose={() => setInspectAttemptId(null)}
        title={inspection?.test?.title || inspection?.attempt.testTitle || 'Attempt Inspection'}
        subtitle={
          inspection
            ? `Attempt #${inspection.attempt.attemptId}${
                inspection.testSeries?.title ? ` · ${inspection.testSeries.title}` : ''
              }`
            : 'Loading detailed response breakdown...'
        }
        maxWidthClass="max-w-4xl"
      >
        {loadingInspection ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
            <p className="text-xs text-gray-500">Fetching full attempt answers...</p>
          </div>
        ) : inspectionError ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-4 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{inspectionError}</span>
          </div>
        ) : inspection ? (
          <div className="space-y-5">
            {/* Attempt Score Banner */}
            <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-800">
                  Final Score
                </p>
                <p className="text-2xl font-bold text-indigo-700 mt-0.5">
                  {Number(inspection.attempt.score).toFixed(2)}{' '}
                  <span className="text-sm font-medium text-indigo-400">
                    / {inspection.attempt.totalMarks}
                  </span>
                </p>
                <p className="text-xs text-indigo-700 mt-1">
                  Percentage: <strong>{formatPercent(inspection.attempt.percentage)}</strong> · Accuracy:{' '}
                  <strong>{formatPercent(inspection.attempt.accuracy)}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-white rounded-lg px-3 py-2 border border-indigo-100">
                  <p className="text-[10px] uppercase text-gray-500 font-semibold">Correct</p>
                  <p className="text-base font-bold text-emerald-600">
                    {inspection.attempt.correctAnswers}
                  </p>
                </div>
                <div className="bg-white rounded-lg px-3 py-2 border border-indigo-100">
                  <p className="text-[10px] uppercase text-gray-500 font-semibold">Wrong</p>
                  <p className="text-base font-bold text-rose-600">
                    {inspection.attempt.wrongAnswers}
                  </p>
                </div>
                <div className="bg-white rounded-lg px-3 py-2 border border-indigo-100">
                  <p className="text-[10px] uppercase text-gray-500 font-semibold">Skipped</p>
                  <p className="text-base font-bold text-amber-600">
                    {inspection.attempt.skippedQuestions}
                  </p>
                </div>
                <div className="bg-white rounded-lg px-3 py-2 border border-indigo-100">
                  <p className="text-[10px] uppercase text-gray-500 font-semibold">Time</p>
                  <p className="text-base font-bold text-gray-800">
                    {formatDurationSeconds(inspection.attempt.timeTakenSeconds)}
                  </p>
                </div>
              </div>
            </div>

            {/* Meta Info Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div>
                <span className="text-gray-500 block">Status</span>
                <span className="font-semibold text-gray-900">{inspection.attempt.status}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Rank / Percentile</span>
                <span className="font-semibold text-gray-900">
                  {inspection.attempt.rank ? `#${inspection.attempt.rank}` : '—'} /{' '}
                  {inspection.attempt.percentile !== null
                    ? formatPercent(inspection.attempt.percentile)
                    : '—'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Started At</span>
                <span className="font-semibold text-gray-900">
                  {formatDateTime(inspection.attempt.startedAt)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Submitted At</span>
                <span className="font-semibold text-gray-900">
                  {formatDateTime(inspection.attempt.submittedAt || inspection.attempt.createdAt)}
                </span>
              </div>
            </div>

            {/* Subject Breakdown inside Attempt */}
            {inspection.subjectBreakdown.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Section / Subject Breakdown
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                        <th className="py-2 px-3">Subject</th>
                        <th className="py-2 px-3 text-right">Questions</th>
                        <th className="py-2 px-3 text-right">Correct</th>
                        <th className="py-2 px-3 text-right">Wrong</th>
                        <th className="py-2 px-3 text-right">Skipped</th>
                        <th className="py-2 px-3 text-right">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {inspection.subjectBreakdown.map((sb, idx) => (
                        <tr key={`${sb.subjectName}-${idx}`}>
                          <td className="py-2 px-3 font-semibold text-gray-900">{sb.subjectName}</td>
                          <td className="py-2 px-3 text-right">{sb.totalQuestions}</td>
                          <td className="py-2 px-3 text-right text-emerald-700 font-medium">
                            {sb.correctAnswers}
                          </td>
                          <td className="py-2 px-3 text-right text-rose-600 font-medium">
                            {sb.wrongAnswers}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-500">
                            {sb.skippedQuestions}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold">
                            {formatPercent(sb.averageAccuracy)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Question-level Response Review */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <FileSearch className="w-4 h-4 text-indigo-600" />
                  Question-by-Question Review ({inspection.questions.length})
                </h4>
                {inspection.questions.length > 0 && (
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
                    {(['ALL', 'CORRECT', 'WRONG', 'SKIPPED'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setQuestionFilter(tab)}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                          questionFilter === tab
                            ? 'bg-white text-indigo-600 shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {filteredQuestions.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  {inspection.questions.length === 0
                    ? 'No question-level responses recorded for this attempt.'
                    : 'No questions match the selected filter.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQuestions.map((q) => (
                    <div
                      key={String(q.id)}
                      className="border border-gray-200 rounded-xl p-4 space-y-2.5 bg-white"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-gray-900">Q{q.order}.</span>
                          {q.subjectName && (
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                              {q.subjectName}
                            </span>
                          )}
                          {q.difficulty && (
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium capitalize">
                              {q.difficulty}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {q.timeSpentSeconds !== null && q.timeSpentSeconds !== undefined && (
                            <span className="text-gray-500">
                              {formatDurationSeconds(q.timeSpentSeconds)}
                            </span>
                          )}
                          <span className="font-semibold text-gray-700">
                            {q.marksAwarded > 0 ? `+${q.marksAwarded}` : q.marksAwarded} / {q.maxMarks}
                          </span>
                          {q.isCorrect ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> Correct
                            </span>
                          ) : q.isSkipped ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">
                              <MinusCircle className="w-3 h-3" /> Skipped
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold">
                              <XCircle className="w-3 h-3" /> Wrong
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-900 font-medium">{q.questionText}</p>

                      {q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt) => {
                            const isSelected =
                              q.selectedOption &&
                              opt.key.toUpperCase() === q.selectedOption.toUpperCase();
                            const isRight =
                              opt.isCorrect ||
                              (q.correctOption &&
                                opt.key.toUpperCase() === q.correctOption.toUpperCase());

                            let boxClasses = 'border-gray-200 bg-gray-50/70 text-gray-700';
                            if (isRight) {
                              boxClasses = 'border-emerald-300 bg-emerald-50 text-emerald-900';
                            } else if (isSelected && !isRight) {
                              boxClasses = 'border-rose-300 bg-rose-50 text-rose-900';
                            }

                            return (
                              <div
                                key={opt.key}
                                className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${boxClasses}`}
                              >
                                <span>
                                  <strong className="mr-1.5">{opt.key}.</strong>
                                  {opt.text}
                                </span>
                                <span className="shrink-0 font-semibold">
                                  {isSelected && isRight
                                    ? 'Chosen ✓'
                                    : isRight
                                    ? 'Answer ✓'
                                    : isSelected
                                    ? 'Chosen ✗'
                                    : ''}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.options.length === 0 && (q.selectedOption || q.correctOption) && (
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                          <span>
                            Selected: <strong>{q.selectedOption || 'None'}</strong>
                          </span>
                          <span>
                            Correct: <strong className="text-emerald-700">{q.correctOption || '—'}</strong>
                          </span>
                        </div>
                      )}

                      {q.explanation && (
                        <div className="text-xs text-gray-600 bg-blue-50/70 border border-blue-100 rounded-lg px-3 py-2">
                          <strong className="text-blue-900">Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}

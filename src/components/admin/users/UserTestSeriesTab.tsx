'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { asRecord, extractArray, toNum, toStr } from '../../../services/admin/dashboardNormalizer';
import type {
  UserTestSeriesEnrollment,
  UserTestSeriesListResponse,
} from '../../../types/admin/user';
import type { SimpleSeriesOption } from '../../../utils/adminLookups';
import {
  formatCompactNumber,
  formatDate,
  formatINR,
  getErrorMessage,
  getStatusBadgeClasses,
} from '../../../utils/formatters';
import AdminModal from '../AdminModal';
import { StatCard } from '../DashboardStats';

interface UserTestSeriesTabProps {
  userId: string;
  onDataChange?: () => void;
}

export default function UserTestSeriesTab({ userId, onDataChange }: UserTestSeriesTabProps) {
  const [data, setData] = useState<UserTestSeriesListResponse | null>(null);
  const [seriesOptions, setSeriesOptions] = useState<SimpleSeriesOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Assign modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    testSeriesId: '',
    accessType: 'MANUAL',
    status: 'ACTIVE',
    durationDays: '365',
    expiresAt: '',
    notes: '',
  });

  // Extend modal
  const [extendTarget, setExtendTarget] = useState<UserTestSeriesEnrollment | null>(null);
  const [extendMode, setExtendMode] = useState<'days' | 'date'>('days');
  const [extendDays, setExtendDays] = useState('30');
  const [extendExpiresAt, setExtendExpiresAt] = useState('');
  const [extendNotes, setExtendNotes] = useState('');

  // Status modal
  const [statusTarget, setStatusTarget] = useState<UserTestSeriesEnrollment | null>(null);
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [statusNotes, setStatusNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const fetchSeriesData = useCallback(async () => {
    return await adminService.getUserTestSeries(userId);
  }, [userId]);

  const loadSeries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSeriesData();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch user test series:', err);
      setError(getErrorMessage(err, 'Failed to load enrolled test series.'));
    } finally {
      setLoading(false);
    }
  }, [fetchSeriesData]);

  useEffect(() => {
    let active = true;
    fetchSeriesData()
      .then((res) => {
        if (!active) return;
        setData(res);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to fetch user test series:', err);
        setError(getErrorMessage(err, 'Failed to load enrolled test series.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchSeriesData]);

  useEffect(() => {
    adminService
      .getTestSeries()
      .then((res) => {
        const list = extractArray(res, ['testSeries', 'series', 'items', 'rows']).map((s) => {
          const r = asRecord(s);
          return {
            id: (r.id ?? '') as string | number,
            title: toStr(r.title ?? r.name, `Series #${r.id}`),
            price: toNum(r.price),
            isFree: Boolean(r.is_free ?? r.isFree),
          };
        });
        setSeriesOptions(list);
      })
      .catch(() => setSeriesOptions([]));
  }, []);

  const handleAssignSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.testSeriesId) return;
    setSubmitting(true);
    try {
      await adminService.assignUserTestSeries(userId, {
        testSeriesId: assignForm.testSeriesId,
        accessType: assignForm.accessType || undefined,
        status: assignForm.status || 'ACTIVE',
        durationDays: assignForm.durationDays ? Number(assignForm.durationDays) : undefined,
        expiresAt: assignForm.expiresAt || undefined,
        notes: assignForm.notes || undefined,
      });
      setIsAssignOpen(false);
      setAssignForm({
        testSeriesId: '',
        accessType: 'MANUAL',
        status: 'ACTIVE',
        durationDays: '365',
        expiresAt: '',
        notes: '',
      });
      setActionMessage('Test series assigned to student successfully.');
      await loadSeries();
      onDataChange?.();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to assign test series.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleExtendAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendTarget) return;
    setSubmitting(true);
    try {
      await adminService.extendUserTestSeries(userId, extendTarget.id, {
        days: extendMode === 'days' && extendDays ? Number(extendDays) : undefined,
        expiresAt: extendMode === 'date' && extendExpiresAt ? extendExpiresAt : undefined,
        notes: extendNotes || undefined,
      });
      setExtendTarget(null);
      setExtendDays('30');
      setExtendExpiresAt('');
      setExtendNotes('');
      setActionMessage('Test series access extended successfully.');
      await loadSeries();
      onDataChange?.();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to extend test series access.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusTarget) return;
    setSubmitting(true);
    try {
      await adminService.updateUserTestSeriesStatus(userId, statusTarget.id, {
        status: newStatus,
        notes: statusNotes || undefined,
      });
      setStatusTarget(null);
      setStatusNotes('');
      setActionMessage(`Enrollment status updated to ${newStatus}.`);
      await loadSeries();
      onDataChange?.();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update enrollment status.'));
    } finally {
      setSubmitting(false);
    }
  };

  const summary = data?.summary ?? {
    totalEnrolled: 0,
    activeCount: 0,
    expiredCount: 0,
    cancelledCount: 0,
    pendingCount: 0,
  };
  const enrollments = data?.enrollments ?? [];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enrolled"
          value={formatCompactNumber(summary.totalEnrolled)}
          subtitle="Assigned & purchased series"
          icon={<BookOpen className="w-5 h-5" />}
          accentClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Active Access"
          value={formatCompactNumber(summary.activeCount)}
          subtitle="Currently unlocked"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Expired"
          value={formatCompactNumber(summary.expiredCount)}
          subtitle="Available to extend"
          icon={<Clock className="w-5 h-5" />}
          accentClass="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Cancelled / Pending"
          value={formatCompactNumber(summary.cancelledCount + summary.pendingCount)}
          subtitle={`${summary.cancelledCount} cancelled · ${summary.pendingCount} pending`}
          icon={<XCircle className="w-5 h-5" />}
          accentClass="bg-rose-50 text-rose-600"
        />
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
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
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadSeries}
            className="font-semibold text-rose-700 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Enrolled Series Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Enrolled Test Series</h3>
            <p className="text-xs text-gray-500">
              Assign new series, extend expiration dates, or change enrollment status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadSeries}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setIsAssignOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Assign Test Series
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70">
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Test Series
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Access
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Progress
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Enrolled
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Expires
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 text-xs">
                    Student is not enrolled in any test series yet.
                  </td>
                </tr>
              ) : (
                enrollments.map((enr) => (
                  <tr key={String(enr.id)} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">{enr.testSeriesTitle}</p>
                      <p className="text-[11px] text-gray-500">Enrollment #{enr.id}</p>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                        {enr.accessType || enr.source || 'STANDARD'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {enr.totalTests ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{
                                width: `${Math.min(100, Math.max(0, enr.progressPercent ?? 0))}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {enr.testsCompleted ?? 0}/{enr.totalTests}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {formatDate(enr.enrolledAt || enr.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-700">
                      <p>{enr.expiresAt ? formatDate(enr.expiresAt) : 'Lifetime / No expiry'}</p>
                      {enr.daysRemaining !== null && enr.daysRemaining !== undefined && (
                        <p className="text-[11px] text-gray-500">
                          {enr.daysRemaining > 0
                            ? `${enr.daysRemaining}d remaining`
                            : 'Expired'}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadgeClasses(
                          enr.status
                        )}`}
                      >
                        {enr.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setExtendTarget(enr);
                            setExtendMode('days');
                            setExtendDays('30');
                            setExtendExpiresAt('');
                            setExtendNotes('');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                          title="Extend Access"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          Extend
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStatusTarget(enr);
                            setNewStatus(enr.status.toUpperCase() || 'ACTIVE');
                            setStatusNotes(enr.notes || '');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                          title="Update Status"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Test Series Modal */}
      <AdminModal
        open={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign Test Series"
        subtitle="Grant this student direct access to a test series."
      >
        <form onSubmit={handleAssignSeries} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Test Series <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={assignForm.testSeriesId}
              onChange={(e) => setAssignForm({ ...assignForm, testSeriesId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
            >
              <option value="">Select test series...</option>
              {seriesOptions.map((s) => (
                <option key={String(s.id)} value={String(s.id)}>
                  {s.title} {s.isFree ? '(Free)' : `(${formatINR(s.price)})`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Access Type</label>
              <select
                value={assignForm.accessType}
                onChange={(e) => setAssignForm({ ...assignForm, accessType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
              >
                <option value="MANUAL">MANUAL</option>
                <option value="FREE">FREE</option>
                <option value="PAID">PAID</option>
                <option value="PROMOTIONAL">PROMOTIONAL</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={assignForm.status}
                onChange={(e) => setAssignForm({ ...assignForm, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min={1}
                placeholder="e.g. 365"
                value={assignForm.durationDays}
                onChange={(e) => setAssignForm({ ...assignForm, durationDays: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Or Exact Expiry Date
              </label>
              <input
                type="date"
                value={assignForm.expiresAt}
                onChange={(e) => setAssignForm({ ...assignForm, expiresAt: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={assignForm.notes}
              onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
              placeholder="Reason or admin reference..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
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
              Assign Series
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Extend Access Modal */}
      <AdminModal
        open={Boolean(extendTarget)}
        onClose={() => setExtendTarget(null)}
        title="Extend Test Series Access"
        subtitle={
          extendTarget
            ? `${extendTarget.testSeriesTitle} (Current expiry: ${
                extendTarget.expiresAt ? formatDate(extendTarget.expiresAt) : 'None'
              })`
            : ''
        }
      >
        <form onSubmit={handleExtendAccess} className="space-y-4">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setExtendMode('days')}
              className={`flex-1 py-1.5 rounded-md font-semibold transition-colors ${
                extendMode === 'days' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-600'
              }`}
            >
              Add Days
            </button>
            <button
              type="button"
              onClick={() => setExtendMode('date')}
              className={`flex-1 py-1.5 rounded-md font-semibold transition-colors ${
                extendMode === 'date' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-600'
              }`}
            >
              Set New Expiry Date
            </button>
          </div>

          {extendMode === 'days' ? (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">
                Extend By (Days) <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['7', '15', '30', '90', '180', '365'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setExtendDays(preset)}
                    className={`px-2.5 py-1 text-xs rounded-md border font-medium ${
                      extendDays === preset
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    +{preset}d
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                required
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                New Expiration Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={extendExpiresAt}
                onChange={(e) => setExtendExpiresAt(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={extendNotes}
              onChange={(e) => setExtendNotes(e.target.value)}
              placeholder="Extension reason..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setExtendTarget(null)}
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
              Extend Access
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Update Enrollment Status Modal */}
      <AdminModal
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        title="Update Enrollment Status"
        subtitle={statusTarget ? `${statusTarget.testSeriesTitle} (#${statusTarget.id})` : ''}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Reason for status change..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setStatusTarget(null)}
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
    </div>
  );
}

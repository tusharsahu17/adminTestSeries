'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit3,
  GraduationCap,
  Loader2,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import AdminModal from '../../../components/admin/AdminModal';
import { StatCard } from '../../../components/admin/DashboardStats';
import { adminService } from '../../../services/adminService';
import { Enrollment } from '../../../types/admin/enrollment';
import {
  fetchUsersAndSeries,
  SimpleSeriesOption,
  SimpleUserOption,
} from '../../../utils/adminLookups';
import {
  formatCompactNumber,
  formatDateTime,
  getErrorMessage,
  getStatusBadgeClasses,
} from '../../../utils/formatters';

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [users, setUsers] = useState<SimpleUserOption[]>([]);
  const [seriesList, setSeriesList] = useState<SimpleSeriesOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [seriesFilter, setSeriesFilter] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Enrollment | null>(null);
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [statusNotes, setStatusNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    userId: '',
    testSeriesId: '',
    status: 'ACTIVE',
    accessType: 'MANUAL',
    expiresAt: '',
    notes: '',
  });

  const loadEnrollmentsList = useCallback(async () => {
    const params: Record<string, unknown> = {};
    if (statusFilter !== 'ALL') params.status = statusFilter;
    if (seriesFilter) params.testSeriesId = seriesFilter;
    return await adminService.getEnrollments(params);
  }, [statusFilter, seriesFilter]);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await loadEnrollmentsList();
      setEnrollments(list);
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
      setError(getErrorMessage(err, 'Failed to fetch enrollments.'));
    } finally {
      setLoading(false);
    }
  }, [loadEnrollmentsList]);

  useEffect(() => {
    let active = true;
    loadEnrollmentsList()
      .then((list) => {
        if (!active) return;
        setEnrollments(list);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to fetch enrollments:', err);
        setError(getErrorMessage(err, 'Failed to fetch enrollments.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadEnrollmentsList]);

  useEffect(() => {
    fetchUsersAndSeries().then(({ users: u, series: s }) => {
      setUsers(u);
      setSeriesList(s);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return enrollments.filter((enr) => {
      if (statusFilter !== 'ALL' && enr.status.toUpperCase() !== statusFilter) return false;
      if (seriesFilter && String(enr.testSeriesId ?? '') !== seriesFilter) return false;
      if (!q) return true;
      return (
        String(enr.id).toLowerCase().includes(q) ||
        (enr.userName || '').toLowerCase().includes(q) ||
        (enr.userEmail || '').toLowerCase().includes(q) ||
        (enr.testSeriesTitle || '').toLowerCase().includes(q)
      );
    });
  }, [enrollments, searchTerm, statusFilter, seriesFilter]);

  const counts = useMemo(() => {
    let active = 0;
    let pending = 0;
    let inactive = 0;
    for (const e of enrollments) {
      const st = e.status.toUpperCase();
      if (st === 'ACTIVE') active += 1;
      else if (st === 'PENDING') pending += 1;
      else inactive += 1;
    }
    return { total: enrollments.length, active, pending, inactive };
  }, [enrollments]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.testSeriesId) return;
    setSubmitting(true);
    try {
      await adminService.createEnrollment({
        userId: form.userId,
        testSeriesId: form.testSeriesId,
        status: form.status,
        accessType: form.accessType || undefined,
        expiresAt: form.expiresAt || undefined,
        notes: form.notes || undefined,
      });
      setIsCreateOpen(false);
      setForm({
        userId: '',
        testSeriesId: '',
        status: 'ACTIVE',
        accessType: 'MANUAL',
        expiresAt: '',
        notes: '',
      });
      setActionMessage('Student enrolled in test series successfully.');
      fetchEnrollments();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to create enrollment.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusTarget) return;
    setSubmitting(true);
    try {
      await adminService.updateEnrollmentStatus(statusTarget.id, {
        status: newStatus,
        notes: statusNotes || undefined,
      });
      setStatusTarget(null);
      setStatusNotes('');
      setActionMessage(`Enrollment #${statusTarget.id} updated to ${newStatus}.`);
      fetchEnrollments();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to update enrollment status.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Enrollments</h1>
          <p className="text-sm text-gray-500">
            Manage test series enrollments, manual grants, and access statuses.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/payments"
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg"
          >
            Payments
          </Link>
          <Link
            href="/admin/subscriptions"
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg"
          >
            Subscriptions
          </Link>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
          >
            <Plus className="w-4 h-4" /> Enroll Student
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enrollments"
          value={formatCompactNumber(counts.total)}
          icon={<GraduationCap className="w-5 h-5" />}
          accentClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Active Access"
          value={formatCompactNumber(counts.active)}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Pending"
          value={formatCompactNumber(counts.pending)}
          icon={<Clock className="w-5 h-5" />}
          accentClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Cancelled / Expired"
          value={formatCompactNumber(counts.inactive)}
          icon={<XCircle className="w-5 h-5" />}
          accentClass="bg-rose-50 text-rose-600"
        />
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
          <span>{actionMessage}</span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchEnrollments}
            className="text-xs font-semibold hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      <section className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search student or test series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <select
              value={seriesFilter}
              onChange={(e) => setSeriesFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
            >
              <option value="">All Test Series</option>
              {seriesList.map((s) => (
                <option key={String(s.id)} value={String(s.id)}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70">
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Test Series
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Access / Source
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Enrolled At
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No enrollments found.
                  </td>
                </tr>
              ) : (
                filtered.map((enr) => (
                  <tr key={String(enr.id)} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-semibold text-gray-900">#{enr.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        {enr.userName || (enr.userId ? `User #${enr.userId}` : 'Unknown')}
                      </p>
                      {enr.userEmail && <p className="text-xs text-gray-500">{enr.userEmail}</p>}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {enr.testSeriesTitle ||
                        (enr.testSeriesId ? `Series #${enr.testSeriesId}` : '—')}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      <span>{enr.accessType || enr.source || 'STANDARD'}</span>
                      {enr.paymentId && (
                        <span className="ml-1.5 text-indigo-600 font-medium">
                          (Payment #{enr.paymentId})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {formatDateTime(enr.enrolledAt || enr.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClasses(
                          enr.status
                        )}`}
                      >
                        {enr.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setStatusTarget(enr);
                          setNewStatus(enr.status.toUpperCase() || 'ACTIVE');
                          setStatusNotes('');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AdminModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Enroll Student"
        subtitle="Manually grant a student access to a test series."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Student <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
            >
              <option value="">Select student...</option>
              {users.map((u) => (
                <option key={String(u.id)} value={String(u.id)}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Test Series <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={form.testSeriesId}
              onChange={(e) => setForm({ ...form, testSeriesId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
            >
              <option value="">Select test series...</option>
              {seriesList.map((s) => (
                <option key={String(s.id)} value={String(s.id)}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Access Type</label>
              <select
                value={form.accessType}
                onChange={(e) => setForm({ ...form, accessType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
              >
                <option value="MANUAL">MANUAL</option>
                <option value="FREE">FREE</option>
                <option value="PAID">PAID</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Expires At (Optional)
            </label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Enroll Student
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        title={`Update Enrollment #${statusTarget?.id ?? ''} Status`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setStatusTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Update Status
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

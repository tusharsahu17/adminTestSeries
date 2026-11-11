'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Crown,
  Edit3,
  Loader2,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import AdminModal from '../../../components/admin/AdminModal';
import { StatCard } from '../../../components/admin/DashboardStats';
import { adminService } from '../../../services/adminService';
import { Subscription } from '../../../types/admin/subscription';
import {
  fetchUsersAndSeries,
  SimpleSeriesOption,
  SimpleUserOption,
} from '../../../utils/adminLookups';
import {
  formatCompactNumber,
  formatDate,
  formatINR,
  getErrorMessage,
  getStatusBadgeClasses,
} from '../../../utils/formatters';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<SimpleUserOption[]>([]);
  const [seriesList, setSeriesList] = useState<SimpleSeriesOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Subscription | null>(null);
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [statusNotes, setStatusNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    userId: '',
    planName: 'Pro All-Access',
    testSeriesId: '',
    amount: '',
    durationDays: '30',
    status: 'ACTIVE',
    notes: '',
  });

  const loadSubscriptionsList = useCallback(async () => {
    const params: Record<string, unknown> = {};
    if (statusFilter !== 'ALL') params.status = statusFilter;
    return await adminService.getSubscriptions(params);
  }, [statusFilter]);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await loadSubscriptionsList();
      setSubscriptions(list);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
      setError(getErrorMessage(err, 'Failed to load subscriptions.'));
    } finally {
      setLoading(false);
    }
  }, [loadSubscriptionsList]);

  useEffect(() => {
    let active = true;
    loadSubscriptionsList()
      .then((list) => {
        if (!active) return;
        setSubscriptions(list);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to fetch subscriptions:', err);
        setError(getErrorMessage(err, 'Failed to load subscriptions.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadSubscriptionsList]);

  useEffect(() => {
    fetchUsersAndSeries().then(({ users: u, series: s }) => {
      setUsers(u);
      setSeriesList(s);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return subscriptions.filter((sub) => {
      if (statusFilter !== 'ALL' && sub.status.toUpperCase() !== statusFilter) return false;
      if (!q) return true;
      return (
        String(sub.id).toLowerCase().includes(q) ||
        sub.planName.toLowerCase().includes(q) ||
        (sub.userName || '').toLowerCase().includes(q) ||
        (sub.userEmail || '').toLowerCase().includes(q) ||
        (sub.testSeriesTitle || '').toLowerCase().includes(q)
      );
    });
  }, [subscriptions, searchTerm, statusFilter]);

  const counts = useMemo(() => {
    let active = 0;
    let pending = 0;
    let cancelledOrExpired = 0;
    for (const s of subscriptions) {
      const st = s.status.toUpperCase();
      if (st === 'ACTIVE') active += 1;
      else if (st === 'PENDING') pending += 1;
      else cancelledOrExpired += 1;
    }
    return { total: subscriptions.length, active, pending, cancelledOrExpired };
  }, [subscriptions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.planName.trim()) return;
    setSubmitting(true);
    try {
      await adminService.createSubscription({
        userId: form.userId,
        planName: form.planName.trim(),
        testSeriesId: form.testSeriesId || undefined,
        amount: form.amount ? Number(form.amount) : undefined,
        durationDays: form.durationDays ? Number(form.durationDays) : undefined,
        status: form.status,
        notes: form.notes || undefined,
      });
      setIsCreateOpen(false);
      setForm({
        userId: '',
        planName: 'Pro All-Access',
        testSeriesId: '',
        amount: '',
        durationDays: '30',
        status: 'ACTIVE',
        notes: '',
      });
      setActionMessage('Subscription created successfully.');
      fetchSubscriptions();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to create subscription.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusTarget) return;
    setSubmitting(true);
    try {
      await adminService.updateSubscriptionStatus(statusTarget.id, {
        status: newStatus,
        notes: statusNotes || undefined,
      });
      setStatusTarget(null);
      setStatusNotes('');
      setActionMessage(`Subscription #${statusTarget.id} updated to ${newStatus}.`);
      fetchSubscriptions();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to update subscription status.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-sm text-gray-500">
            Manage paid student plans, validity windows, and subscription statuses.
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
            href="/admin/enrollments"
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg"
          >
            Enrollments
          </Link>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
          >
            <Plus className="w-4 h-4" /> New Subscription
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Subscriptions"
          value={formatCompactNumber(counts.total)}
          icon={<Crown className="w-5 h-5" />}
          accentClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Active"
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
          title="Expired / Cancelled"
          value={formatCompactNumber(counts.cancelledOrExpired)}
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
            onClick={fetchSubscriptions}
            className="text-xs font-semibold hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      <section className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search student, plan, or series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
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
                  Plan / Series
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Validity
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
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={String(sub.id)} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-semibold text-gray-900">#{sub.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        {sub.userName || (sub.userId ? `User #${sub.userId}` : 'Unknown')}
                      </p>
                      {sub.userEmail && <p className="text-xs text-gray-500">{sub.userEmail}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">{sub.planName}</p>
                      {(sub.testSeriesTitle || sub.testSeriesId) && (
                        <p className="text-xs text-gray-500">
                          {sub.testSeriesTitle || `Series #${sub.testSeriesId}`}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {formatINR(sub.amount)}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      <div>Start: {formatDate(sub.startsAt || sub.createdAt)}</div>
                      <div>Expires: {formatDate(sub.expiresAt)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClasses(
                          sub.status
                        )}`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setStatusTarget(sub);
                          setNewStatus(sub.status.toUpperCase() || 'ACTIVE');
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
        title="Create Subscription"
        subtitle="Grant a subscription plan to a student."
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Plan Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.planName}
                onChange={(e) => setForm({ ...form, planName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Linked Series (Optional)
              </label>
              <select
                value={form.testSeriesId}
                onChange={(e) => setForm({ ...form, testSeriesId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
              >
                <option value="">All / None</option>
                {seriesList.map((s) => (
                  <option key={String(s.id)} value={String(s.id)}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (INR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="999"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                value={form.durationDays}
                onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
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
              Create Subscription
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        title={`Update Subscription #${statusTarget?.id ?? ''} Status`}
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

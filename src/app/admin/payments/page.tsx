'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  XCircle,
} from 'lucide-react';
import AdminModal from '../../../components/admin/AdminModal';
import { StatCard } from '../../../components/admin/DashboardStats';
import PaymentTable from '../../../components/admin/PaymentTable';
import { adminService } from '../../../services/adminService';
import { Payment } from '../../../types/admin/payment';
import {
  fetchUsersAndSeries,
  SimpleSeriesOption,
  SimpleUserOption,
} from '../../../utils/adminLookups';
import {
  formatCompactNumber,
  formatDateTime,
  formatINR,
  getErrorMessage,
  getStatusBadgeClasses,
} from '../../../utils/formatters';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<SimpleUserOption[]>([]);
  const [seriesList, setSeriesList] = useState<SimpleSeriesOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Payment | null>(null);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({
    userId: '',
    testSeriesId: '',
    subscriptionId: '',
    amount: '',
    status: 'SUCCESS',
    paymentMethod: 'UPI',
    transactionId: '',
    notes: '',
  });
  const [newStatus, setNewStatus] = useState('SUCCESS');
  const [statusNotes, setStatusNotes] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  const loadPaymentsList = useCallback(async () => {
    const params: Record<string, unknown> = {};
    if (statusFilter !== 'ALL') params.status = statusFilter;
    if (searchTerm.trim()) params.search = searchTerm.trim();
    return await adminService.getPayments(params);
  }, [statusFilter, searchTerm]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await loadPaymentsList();
      setPayments(list);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError(getErrorMessage(err, 'Failed to fetch payments.'));
    } finally {
      setLoading(false);
    }
  }, [loadPaymentsList]);

  useEffect(() => {
    let active = true;
    loadPaymentsList()
      .then((list) => {
        if (!active) return;
        setPayments(list);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to fetch payments:', err);
        setError(getErrorMessage(err, 'Failed to fetch payments.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadPaymentsList]);

  useEffect(() => {
    fetchUsersAndSeries().then(({ users: u, series: s }) => {
      setUsers(u);
      setSeriesList(s);
    });
  }, []);

  const filteredPayments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return payments.filter((p) => {
      if (statusFilter !== 'ALL' && p.status.toUpperCase() !== statusFilter) return false;
      if (!q) return true;
      return (
        String(p.id).toLowerCase().includes(q) ||
        (p.transactionId || '').toLowerCase().includes(q) ||
        (p.userName || '').toLowerCase().includes(q) ||
        (p.userEmail || '').toLowerCase().includes(q) ||
        (p.testSeriesTitle || '').toLowerCase().includes(q)
      );
    });
  }, [payments, searchTerm, statusFilter]);

  const summary = useMemo(() => {
    let totalCollected = 0;
    let successCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let refundedCount = 0;

    for (const p of payments) {
      const st = p.status.toUpperCase();
      if (st === 'SUCCESS' || st === 'PAID') {
        successCount += 1;
        totalCollected += p.amount;
      } else if (st === 'PENDING') {
        pendingCount += 1;
      } else if (st === 'FAILED') {
        failedCount += 1;
      } else if (st === 'REFUNDED') {
        refundedCount += 1;
      }
    }
    return { totalCollected, successCount, pendingCount, failedCount, refundedCount };
  }, [payments]);

  const handleOpenDetail = async (payment: Payment) => {
    setDetailPayment(payment);
    setLoadingDetail(true);
    try {
      const fresh = await adminService.getPaymentById(payment.id);
      setDetailPayment(fresh);
    } catch (err) {
      console.error('Failed to load payment details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.userId || !createForm.amount) return;
    setSubmitting(true);
    setError(null);
    try {
      await adminService.createPayment({
        userId: createForm.userId,
        testSeriesId: createForm.testSeriesId || undefined,
        subscriptionId: createForm.subscriptionId || undefined,
        amount: Number(createForm.amount),
        currency: 'INR',
        status: createForm.status,
        paymentMethod: createForm.paymentMethod || undefined,
        transactionId: createForm.transactionId || undefined,
        notes: createForm.notes || undefined,
      });
      setIsCreateOpen(false);
      setCreateForm({
        userId: '',
        testSeriesId: '',
        subscriptionId: '',
        amount: '',
        status: 'SUCCESS',
        paymentMethod: 'UPI',
        transactionId: '',
        notes: '',
      });
      setActionMessage(
        createForm.status === 'SUCCESS'
          ? 'Payment recorded as SUCCESS. Student enrollment & paid access activated.'
          : 'Payment recorded successfully.'
      );
      fetchPayments();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to create payment.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusTarget) return;
    setSubmitting(true);
    try {
      await adminService.updatePaymentStatus(statusTarget.id, {
        status: newStatus,
        notes: statusNotes || undefined,
      });
      setStatusTarget(null);
      setStatusNotes('');
      setActionMessage(
        newStatus === 'SUCCESS'
          ? `Payment #${statusTarget.id} marked SUCCESS (linked access activated).`
          : `Payment #${statusTarget.id} status updated to ${newStatus}.`
      );
      fetchPayments();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to update payment status.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTarget) return;
    setSubmitting(true);
    try {
      await adminService.refundPayment(refundTarget.id, {
        reason: refundReason || undefined,
        amount: refundAmount ? Number(refundAmount) : undefined,
      });
      setRefundTarget(null);
      setRefundReason('');
      setRefundAmount('');
      setActionMessage(
        `Payment #${refundTarget.id} refunded. Linked enrollment/subscription access cancelled.`
      );
      fetchPayments();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to refund payment.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Refunds</h1>
          <p className="text-sm text-gray-500">
            Track transactions, verify payments (auto-enrolling on SUCCESS), and process refunds.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/subscriptions"
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
          >
            Subscriptions
          </Link>
          <Link
            href="/admin/enrollments"
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
          >
            Enrollments
          </Link>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Record Payment
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Successful Revenue"
          value={formatINR(summary.totalCollected)}
          subtitle={`${formatCompactNumber(summary.successCount)} successful payments`}
          icon={<CreditCard className="w-5 h-5" />}
          accentClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Pending"
          value={formatCompactNumber(summary.pendingCount)}
          subtitle="Awaiting confirmation"
          icon={<Clock className="w-5 h-5" />}
          accentClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Failed"
          value={formatCompactNumber(summary.failedCount)}
          subtitle="Unsuccessful attempts"
          icon={<XCircle className="w-5 h-5" />}
          accentClass="bg-rose-50 text-rose-600"
        />
        <StatCard
          title="Refunded"
          value={formatCompactNumber(summary.refundedCount)}
          subtitle="Access cancelled on refund"
          icon={<RefreshCcw className="w-5 h-5" />}
          accentClass="bg-purple-50 text-purple-600"
        />
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-xs font-semibold text-emerald-700 hover:underline"
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
            onClick={fetchPayments}
            className="text-xs font-semibold text-rose-700 hover:underline"
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
              placeholder="Search by student, email, txn ID, or series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'] as const).map((status) => (
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

        <PaymentTable
          payments={filteredPayments}
          loading={loading}
          onViewDetails={handleOpenDetail}
          onEditStatus={(p) => {
            setStatusTarget(p);
            setNewStatus(p.status.toUpperCase() || 'SUCCESS');
            setStatusNotes('');
          }}
          onRefund={(p) => {
            setRefundTarget(p);
            setRefundAmount(String(p.amount || ''));
            setRefundReason('');
          }}
        />
      </section>

      {/* Record Payment Modal */}
      <AdminModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Record Payment"
        subtitle="Setting status to SUCCESS automatically enrolls the student and activates paid access."
      >
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Student <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={createForm.userId}
              onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
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
              Test Series (Optional)
            </label>
            <select
              value={createForm.testSeriesId}
              onChange={(e) => {
                const sid = e.target.value;
                const matched = seriesList.find((s) => String(s.id) === sid);
                setCreateForm({
                  ...createForm,
                  testSeriesId: sid,
                  amount:
                    matched && matched.price > 0 && !createForm.amount
                      ? String(matched.price)
                      : createForm.amount,
                });
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
            >
              <option value="">None / General Payment</option>
              {seriesList.map((s) => (
                <option key={String(s.id)} value={String(s.id)}>
                  {s.title} {s.isFree ? '(Free)' : `(${formatINR(s.price)})`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Amount (INR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={createForm.amount}
                onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                placeholder="499"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
              >
                <option value="SUCCESS">SUCCESS (Auto-Enroll)</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={createForm.paymentMethod}
                onChange={(e) => setCreateForm({ ...createForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
              >
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="NETBANKING">NetBanking</option>
                <option value="RAZORPAY">Razorpay</option>
                <option value="MANUAL">Manual / Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Transaction / Reference ID
              </label>
              <input
                type="text"
                value={createForm.transactionId}
                onChange={(e) => setCreateForm({ ...createForm, transactionId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                placeholder="TXN_123456"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              placeholder="Optional admin notes..."
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
              Save Payment
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Payment Detail Modal */}
      <AdminModal
        open={Boolean(detailPayment)}
        onClose={() => setDetailPayment(null)}
        title={detailPayment ? `Payment #${detailPayment.id}` : 'Payment Details'}
        subtitle="Full transaction, enrollment, and refund metadata"
      >
        {loadingDetail ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : (
          detailPayment && (
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatINR(detailPayment.amount)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClasses(
                    detailPayment.status
                  )}`}
                >
                  {detailPayment.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Student</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {detailPayment.userName || `User #${detailPayment.userId || '-'}`}
                  </p>
                  {detailPayment.userEmail && (
                    <p className="text-gray-500">{detailPayment.userEmail}</p>
                  )}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Test Series / Subscription</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {detailPayment.testSeriesTitle ||
                      (detailPayment.testSeriesId
                        ? `Series #${detailPayment.testSeriesId}`
                        : detailPayment.subscriptionId
                        ? `Subscription #${detailPayment.subscriptionId}`
                        : 'N/A')}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Method / Gateway</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {detailPayment.paymentMethod || detailPayment.gateway || '—'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Transaction ID</p>
                  <p className="font-mono font-semibold text-gray-900 mt-0.5 break-all">
                    {detailPayment.transactionId || '—'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Created / Paid At</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {formatDateTime(detailPayment.paidAt || detailPayment.createdAt)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Refund Info</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {detailPayment.refundedAt
                      ? `${formatINR(detailPayment.refundAmount ?? detailPayment.amount)} on ${formatDateTime(
                          detailPayment.refundedAt
                        )}`
                      : 'Not refunded'}
                  </p>
                </div>
              </div>

              {detailPayment.refundReason && (
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-xs text-purple-800">
                  <strong>Refund Reason:</strong> {detailPayment.refundReason}
                </div>
              )}

              {detailPayment.notes && (
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-700">
                  <strong>Notes:</strong> {detailPayment.notes}
                </div>
              )}
            </div>
          )
        )}
      </AdminModal>

      {/* Update Payment Status Modal */}
      <AdminModal
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        title={`Update Payment #${statusTarget?.id ?? ''} Status`}
        subtitle="Changing status to SUCCESS auto-enrolls the user and activates paid access."
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
            >
              <option value="SUCCESS">SUCCESS</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Optional verification note..."
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

      {/* Refund Modal */}
      <AdminModal
        open={Boolean(refundTarget)}
        onClose={() => setRefundTarget(null)}
        title={`Refund Payment #${refundTarget?.id ?? ''}`}
        subtitle="Refunding automatically cancels linked enrollment and subscription access."
      >
        <form onSubmit={handleRefund} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Refund Amount (INR)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Refund Reason
            </label>
            <textarea
              rows={3}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Customer requested cancellation..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setRefundTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm Refund
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

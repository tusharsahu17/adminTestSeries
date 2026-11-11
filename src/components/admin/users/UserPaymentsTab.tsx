'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Eye,
  IndianRupee,
  Loader2,
  RefreshCcw,
  RefreshCw,
} from 'lucide-react';
import { adminService } from '../../../services/adminService';
import type { Payment } from '../../../types/admin/payment';
import type { PaginationMeta, UserPaymentSummary } from '../../../types/admin/user';
import {
  formatCompactNumber,
  formatDateTime,
  formatINR,
  getErrorMessage,
  getStatusBadgeClasses,
} from '../../../utils/formatters';
import Pagination from '../../ui/Pagination';
import AdminModal from '../AdminModal';
import { StatCard } from '../DashboardStats';

interface UserPaymentsTabProps {
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

const DEFAULT_SUMMARY: UserPaymentSummary = {
  totalPaidAmount: 0,
  totalPayments: 0,
  successfulCount: 0,
  pendingCount: 0,
  failedCount: 0,
  refundedCount: 0,
  refundedAmount: 0,
};

export default function UserPaymentsTab({ userId }: UserPaymentsTabProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<UserPaymentSummary>(DEFAULT_SUMMARY);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Detail modal
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchPaymentsData = useCallback(async () => {
    return await adminService.getUserPayments(userId, {
      page,
      limit: 10,
      status: statusFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  }, [userId, page, statusFilter, startDate, endDate]);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPaymentsData();
      setPayments(res.payments);
      setSummary(res.summary);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch user payments:', err);
      setError(getErrorMessage(err, 'Failed to load payment history.'));
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentsData]);

  useEffect(() => {
    let active = true;
    fetchPaymentsData()
      .then((res) => {
        if (!active) return;
        setPayments(res.payments);
        setSummary(res.summary);
        setPagination(res.pagination);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to fetch user payments:', err);
        setError(getErrorMessage(err, 'Failed to load payment history.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchPaymentsData]);

  const handleOpenDetail = async (payment: Payment) => {
    setDetailPayment(payment);
    setLoadingDetail(true);
    try {
      const fresh = await adminService.getUserPaymentDetail(userId, payment.id);
      setDetailPayment(fresh);
    } catch (err) {
      console.error('Failed to fetch payment detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Paid"
          value={formatINR(summary.totalPaidAmount)}
          subtitle="Completed payments"
          icon={<IndianRupee className="w-5 h-5" />}
          accentClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Total Transactions"
          value={formatCompactNumber(summary.totalPayments)}
          subtitle={`${summary.pendingCount} pending · ${summary.failedCount} failed`}
          icon={<CreditCard className="w-5 h-5" />}
          accentClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Successful"
          value={formatCompactNumber(summary.successfulCount)}
          subtitle="Settled orders"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Refunded"
          value={formatINR(summary.refundedAmount)}
          subtitle={`${summary.refundedCount} refunded transactions`}
          icon={<RefreshCcw className="w-5 h-5" />}
          accentClass="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Payment History</h3>
              <p className="text-xs text-gray-500">
                Paginated & date-filtered student payments with full transaction inspection.
              </p>
            </div>
            <button
              type="button"
              onClick={loadPayments}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter payment status"
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
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
                aria-label="Payment start date"
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
                aria-label="Payment end date"
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700"
              />
            </div>

            {(statusFilter || startDate || endDate) && (
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
            <button type="button" onClick={loadPayments} className="font-semibold hover:underline">
              Retry
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70">
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  ID / Txn
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Target
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Amount
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Method
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">
                  Details
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
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 text-xs">
                    No payments found for this student.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={String(p.id)} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">#{p.id}</p>
                      {p.transactionId && (
                        <p className="text-xs text-gray-500 font-mono truncate max-w-[160px]" title={p.transactionId}>
                          {p.transactionId}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-700 text-xs">
                      {p.testSeriesTitle ? (
                        <span className="font-medium text-gray-900">{p.testSeriesTitle}</span>
                      ) : p.testSeriesId ? (
                        <span>Series #{p.testSeriesId}</span>
                      ) : p.subscriptionId ? (
                        <span>Subscription #{p.subscriptionId}</span>
                      ) : (
                        <span className="text-gray-400">General</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{formatINR(p.amount)}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {p.paymentMethod || p.gateway || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadgeClasses(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {formatDateTime(p.paidAt || p.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
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
          itemCount={payments.length}
          itemLabel="payments"
          onPageChange={setPage}
          loading={loading}
        />
      </div>

      {/* Payment Detail Modal */}
      <AdminModal
        open={Boolean(detailPayment)}
        onClose={() => setDetailPayment(null)}
        title={detailPayment ? `Payment #${detailPayment.id}` : 'Payment Detail'}
        subtitle={
          detailPayment?.transactionId ? `Transaction: ${detailPayment.transactionId}` : undefined
        }
      >
        {detailPayment && (
          <div className="space-y-4 text-sm">
            {loadingDetail && (
              <div className="flex items-center gap-2 text-xs text-indigo-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Refreshing latest payment details...
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                  Amount
                </p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">
                  {formatINR(detailPayment.amount)}{' '}
                  <span className="text-xs font-normal text-gray-500">{detailPayment.currency}</span>
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                  Status
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${getStatusBadgeClasses(
                    detailPayment.status
                  )}`}
                >
                  {detailPayment.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block">Target</span>
                <span className="font-semibold text-gray-900">
                  {detailPayment.testSeriesTitle ||
                    (detailPayment.testSeriesId
                      ? `Series #${detailPayment.testSeriesId}`
                      : detailPayment.subscriptionId
                      ? `Subscription #${detailPayment.subscriptionId}`
                      : 'General Payment')}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Method / Gateway</span>
                <span className="font-semibold text-gray-900">
                  {detailPayment.paymentMethod || detailPayment.gateway || '—'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Transaction / Reference ID</span>
                <span className="font-mono text-gray-900 break-all">
                  {detailPayment.transactionId || detailPayment.referenceId || '—'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Paid At</span>
                <span className="font-semibold text-gray-900">
                  {formatDateTime(detailPayment.paidAt || detailPayment.createdAt)}
                </span>
              </div>
              {detailPayment.refundedAt && (
                <>
                  <div>
                    <span className="text-gray-500 block">Refunded At</span>
                    <span className="font-semibold text-purple-700">
                      {formatDateTime(detailPayment.refundedAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Refund Amount</span>
                    <span className="font-semibold text-purple-700">
                      {formatINR(detailPayment.refundAmount ?? detailPayment.amount)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {detailPayment.refundReason && (
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-xs text-purple-900">
                <strong>Refund Reason:</strong> {detailPayment.refundReason}
              </div>
            )}

            {detailPayment.notes && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700">
                <strong>Notes:</strong> {detailPayment.notes}
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  );
}

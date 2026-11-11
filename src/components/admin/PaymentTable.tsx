'use client';

import React from 'react';
import { Eye, Loader2, RefreshCcw, Edit3 } from 'lucide-react';
import { Payment } from '../../types/admin/payment';
import { formatDateTime, formatINR, getStatusBadgeClasses } from '../../utils/formatters';

interface PaymentTableProps {
  payments: Payment[];
  loading: boolean;
  onViewDetails: (payment: Payment) => void;
  onEditStatus: (payment: Payment) => void;
  onRefund: (payment: Payment) => void;
}

export default function PaymentTable({
  payments,
  loading,
  onViewDetails,
  onEditStatus,
  onRefund,
}: PaymentTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/70">
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ID / Txn
            </th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Student
            </th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Access Target
            </th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Method
            </th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
              Actions
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
          ) : payments.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-12 text-center text-gray-500">
                No payment records found.
              </td>
            </tr>
          ) : (
            payments.map((p) => {
              const statusUpper = String(p.status || '').toUpperCase();
              const canRefund = statusUpper === 'SUCCESS' || statusUpper === 'PAID';

              return (
                <tr key={String(p.id)} className="hover:bg-gray-50/60">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-900">#{p.id}</p>
                    {p.transactionId && (
                      <p className="text-xs text-gray-500 font-mono truncate max-w-[140px]" title={p.transactionId}>
                        {p.transactionId}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">
                      {p.userName || (p.userId ? `User #${p.userId}` : 'Unknown')}
                    </p>
                    {p.userEmail && <p className="text-xs text-gray-500">{p.userEmail}</p>}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {p.testSeriesTitle ? (
                      <span className="font-medium">{p.testSeriesTitle}</span>
                    ) : p.testSeriesId ? (
                      <span>Series #{p.testSeriesId}</span>
                    ) : p.subscriptionId ? (
                      <span>Subscription #{p.subscriptionId}</span>
                    ) : (
                      <span className="text-gray-400">General</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{formatINR(p.amount)}</td>
                  <td className="py-3 px-4 text-gray-600">{p.paymentMethod || '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClasses(
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
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetails(p)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        title="View Payment Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditStatus(p)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Update Status"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {canRefund && (
                        <button
                          type="button"
                          onClick={() => onRefund(p)}
                          className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                          title="Refund Payment"
                        >
                          <RefreshCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

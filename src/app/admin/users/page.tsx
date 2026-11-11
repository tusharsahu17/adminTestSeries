'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  ShieldBan,
  ShieldCheck,
} from 'lucide-react';
import AdminModal from '../../../components/admin/AdminModal';
import Pagination from '../../../components/ui/Pagination';
import { adminService } from '../../../services/adminService';
import type {
  PaginationMeta,
  User,
  UserSubscriptionStatus,
} from '../../../types/admin/user';
import {
  formatDate,
  formatDateTime,
  getErrorMessage,
  getStatusBadgeClasses,
} from '../../../utils/formatters';

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('');

  // Quick subscription modal
  const [subTarget, setSubTarget] = useState<User | null>(null);
  const [targetSubscription, setTargetSubscription] = useState<UserSubscriptionStatus>('active');

  // Quick status modal
  const [statusTarget, setStatusTarget] = useState<User | null>(null);
  const [targetStatus, setTargetStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);

  const loadUsersList = useCallback(async () => {
    return await adminService.getUsersList({
      page,
      limit: 20,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      subscription: subscriptionFilter || undefined,
    });
  }, [page, searchTerm, statusFilter, subscriptionFilter]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loadUsersList();
      setUsers(res.users);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(getErrorMessage(err, 'Failed to fetch users.'));
    } finally {
      setLoading(false);
    }
  }, [loadUsersList]);

  useEffect(() => {
    let active = true;
    loadUsersList()
      .then((res) => {
        if (!active) return;
        setUsers(res.users);
        setPagination(res.pagination);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to fetch users:', err);
        setError(getErrorMessage(err, 'Failed to fetch users.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadUsersList]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleQuickBlockToggle = async (user: User) => {
    const current = (user.status || 'active').toLowerCase();
    const nextStatus = current === 'blocked' ? 'active' : 'blocked';
    if (
      !confirm(
        `Are you sure you want to ${nextStatus === 'blocked' ? 'block' : 'unblock'} ${
          user.name || user.username || 'this user'
        }?`
      )
    ) {
      return;
    }

    try {
      await adminService.updateUserStatus(user.id, nextStatus);
      setActionMessage(`User ${user.name || user.username || `#${user.id}`} is now ${nextStatus}.`);
      await fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update user status.'));
    }
  };

  const handleSaveStatusModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusTarget) return;
    setSubmitting(true);
    try {
      await adminService.updateUserStatus(statusTarget.id, targetStatus);
      setActionMessage(
        `Status updated to "${targetStatus}" for ${
          statusTarget.name || statusTarget.username || `#${statusTarget.id}`
        }.`
      );
      setStatusTarget(null);
      await fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update user status.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSubscriptionModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTarget) return;
    setSubmitting(true);
    try {
      await adminService.updateUserSubscription(subTarget.id, targetSubscription);
      setActionMessage(
        `Subscription updated to "${targetSubscription}" for ${
          subTarget.name || subTarget.username || `#${subTarget.id}`
        }.`
      );
      setSubTarget(null);
      await fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update subscription status.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-5 pb-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">
            View and manage registered students, account statuses, subscriptions, and analytics.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 flex items-center justify-between text-xs">
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
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            className="font-semibold text-rose-700 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      <section className="bg-white rounded-xl shadow-xs border border-gray-200/80 overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <form onSubmit={handleSearch} className="flex-1 min-w-[220px] max-w-md flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, username, or phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by account status"
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>

            <select
              value={subscriptionFilter}
              onChange={(e) => {
                setSubscriptionFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by subscription status"
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Subscriptions</option>
              <option value="active">Pro (Active)</option>
              <option value="inactive">Inactive</option>
              <option value="free">Free</option>
            </select>

            {(searchTerm || statusFilter || subscriptionFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchTerm('');
                  setStatusFilter('');
                  setSubscriptionFilter('');
                  setPage(1);
                }}
                className="px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70">
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const displayName = user.name || user.username || 'Unknown User';
                  const status = (user.status || 'active').toLowerCase();
                  const subStatus = (user.subscriptionStatus || 'free').toLowerCase();

                  return (
                    <tr key={String(user.id)} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="font-semibold text-gray-900 text-sm hover:text-indigo-600 transition-colors"
                            >
                              {displayName}
                            </Link>
                            <p className="text-xs text-gray-500">
                              {user.email || user.phone || `@${user.username}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <button
                          type="button"
                          onClick={() => {
                            setStatusTarget(user);
                            setTargetStatus(status);
                          }}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize hover:opacity-80 ${getStatusBadgeClasses(
                            status
                          )}`}
                          title="Click to update account status"
                        >
                          {status}
                        </button>
                      </td>
                      <td className="py-3 px-5 text-xs text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 px-5 text-xs text-gray-500">
                        {formatDateTime(user.lastActiveAt || user.lastLoginAt)}
                      </td>
                      <td className="py-3 px-5">
                        <button
                          type="button"
                          onClick={() => {
                            setSubTarget(user);
                            setTargetSubscription(subStatus);
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize hover:opacity-80 ${getStatusBadgeClasses(
                            subStatus
                          )}`}
                          title="Click to update subscription status"
                        >
                          {subStatus === 'active' ? 'Pro (Active)' : subStatus}
                        </button>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="View Full Student Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setSubTarget(user);
                              setTargetSubscription(subStatus);
                            }}
                            className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-md transition-colors"
                            title="Toggle Subscription"
                          >
                            <Crown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickBlockToggle(user)}
                            className={`p-1.5 rounded-md transition-colors ${
                              status === 'blocked'
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={status === 'blocked' ? 'Unblock User' : 'Block User'}
                          >
                            {status === 'blocked' ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <ShieldBan className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          itemCount={users.length}
          itemLabel="users"
          onPageChange={setPage}
          loading={loading}
        />
      </section>

      {/* Account Status Modal */}
      <AdminModal
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        title="Update Account Status"
        subtitle={
          statusTarget
            ? `Student: ${statusTarget.name || statusTarget.username || `#${statusTarget.id}`}`
            : ''
        }
      >
        <form onSubmit={handleSaveStatusModal} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(['active', 'inactive', 'blocked'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setTargetStatus(st)}
                className={`py-2.5 px-3 rounded-lg border text-xs font-semibold capitalize transition-colors ${
                  targetStatus === st
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {st}
              </button>
            ))}
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
              Save Status
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Subscription Toggle Modal */}
      <AdminModal
        open={Boolean(subTarget)}
        onClose={() => setSubTarget(null)}
        title="Toggle Subscription Status"
        subtitle={
          subTarget ? `Student: ${subTarget.name || subTarget.username || `#${subTarget.id}`}` : ''
        }
      >
        <form onSubmit={handleSaveSubscriptionModal} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(['active', 'inactive', 'free'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setTargetSubscription(tier)}
                className={`py-2.5 px-3 rounded-lg border text-xs font-semibold capitalize transition-colors ${
                  targetSubscription === tier
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSubTarget(null)}
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
              Save Subscription
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Clock,
  Globe,
  Loader2,
  LogIn,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { adminService } from '../../../services/adminService';
import type { UserActivityResponse } from '../../../types/admin/user';
import {
  formatCompactNumber,
  formatDateTime,
  getErrorMessage,
  getStatusBadgeClasses,
} from '../../../utils/formatters';
import Pagination from '../../ui/Pagination';
import { StatCard } from '../DashboardStats';

interface UserActivityTabProps {
  userId: string;
}

export default function UserActivityTab({ userId }: UserActivityTabProps) {
  const [data, setData] = useState<UserActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchActivityData = useCallback(async () => {
    return await adminService.getUserActivityLogs(userId, {
      page,
      limit: 20,
      type: typeFilter.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  }, [userId, page, typeFilter, startDate, endDate]);

  const loadActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchActivityData();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch user activity:', err);
      setError(getErrorMessage(err, 'Failed to load student activity and login logs.'));
    } finally {
      setLoading(false);
    }
  }, [fetchActivityData]);

  useEffect(() => {
    let active = true;
    fetchActivityData()
      .then((res) => {
        if (!active) return;
        setData(res);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to fetch user activity:', err);
        setError(getErrorMessage(err, 'Failed to load student activity and login logs.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchActivityData]);

  const activities = data?.activities ?? [];
  const loginHistory = data?.loginHistory ?? [];
  const summary = data?.summary ?? {
    totalEvents: 0,
    totalLogins: 0,
    lastLoginAt: null,
    lastActiveAt: null,
  };
  const pagination = data?.pagination ?? {
    page: 1,
    limit: 20,
    total: activities.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Recorded Events"
          value={formatCompactNumber(summary.totalEvents)}
          subtitle="Activity log entries"
          icon={<Activity className="w-5 h-5" />}
          accentClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Login Sessions"
          value={formatCompactNumber(summary.totalLogins)}
          subtitle="Tracked login events"
          icon={<LogIn className="w-5 h-5" />}
          accentClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Last Login"
          value={summary.lastLoginAt ? formatDateTime(summary.lastLoginAt) : '—'}
          subtitle="Latest authentication"
          icon={<ShieldCheck className="w-5 h-5" />}
          accentClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Last Active"
          value={summary.lastActiveAt ? formatDateTime(summary.lastActiveAt) : '—'}
          subtitle="Most recent action"
          icon={<Clock className="w-5 h-5" />}
          accentClass="bg-amber-50 text-amber-600"
        />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={loadActivity} className="font-semibold hover:underline">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Activity Timeline & Logs */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-gray-900">Activity Timeline & Logs</h3>
                <p className="text-xs text-gray-500">
                  Chronological log of test attempts, logins, enrollments, and profile actions.
                </p>
              </div>
              <button
                type="button"
                onClick={loadActivity}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="Filter by event type (e.g. LOGIN, TEST_START)..."
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="flex-1 min-w-[180px] px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                aria-label="Activity start date"
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                aria-label="Activity end date"
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700"
              />
              {(typeFilter || startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('');
                    setStartDate('');
                    setEndDate('');
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : activities.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                No activity logs recorded for the selected filters.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activities.map((act) => (
                  <div
                    key={String(act.id)}
                    className="px-4 py-3 flex items-start justify-between gap-4 hover:bg-gray-50/50"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                          {act.type}
                        </span>
                        {act.category && (
                          <span className="text-[11px] text-gray-500">{act.category}</span>
                        )}
                        {act.ipAddress && (
                          <span className="text-[11px] font-mono text-gray-400">
                            {act.ipAddress}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800">{act.description || '—'}</p>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0 whitespace-nowrap">
                      {formatDateTime(act.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            itemCount={activities.length}
            itemLabel="events"
            onPageChange={setPage}
            loading={loading}
          />
        </div>

        {/* Login History Panel */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              Login History
            </h3>
            <p className="text-xs text-gray-500">Recent sign-in sessions and client devices</p>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : loginHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No login history entries available.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[540px] overflow-y-auto">
              {loginHistory.map((item) => (
                <div key={String(item.id)} className="p-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900">
                      {formatDateTime(item.loginAt)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadgeClasses(
                        item.status || 'SUCCESS'
                      )}`}
                    >
                      {item.status || 'SUCCESS'}
                    </span>
                  </div>
                  {(item.ipAddress || item.location) && (
                    <p className="text-gray-600 font-mono">
                      {[item.ipAddress, item.location].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {(item.device || item.userAgent) && (
                    <p className="text-gray-500 line-clamp-2" title={item.userAgent || undefined}>
                      {item.device || item.userAgent}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

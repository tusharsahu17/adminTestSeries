'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  FileText,
  IndianRupee,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  RevenueAnalyticsPanel,
  StudentAnalyticsPanel,
  StudentPerformancePanel,
  TestAnalyticsPanel,
} from '../../../components/admin/AnalyticsSectionPanels';
import DashboardStats from '../../../components/admin/DashboardStats';
import SeriesPerformancePanel from '../../../components/admin/SeriesPerformancePanel';
import { adminService } from '../../../services/adminService';
import {
  OverviewStats,
  RevenueAnalytics,
  StudentAnalytics,
  StudentPerformanceAnalytics,
  TestAnalytics,
  TestSeriesPerformance,
} from '../../../types/admin/analytics';
import { getErrorMessage } from '../../../utils/formatters';

type AnalyticsTab =
  | 'overview'
  | 'students'
  | 'tests'
  | 'test-series'
  | 'revenue'
  | 'student-performance';

const TABS: Array<{ id: AnalyticsTab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" /> },
  { id: 'tests', label: 'Tests', icon: <FileText className="w-4 h-4" /> },
  { id: 'test-series', label: 'Test Series', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'revenue', label: 'Revenue', icon: <IndianRupee className="w-4 h-4" /> },
  {
    id: 'student-performance',
    label: 'Student Performance',
    icon: <TrendingUp className="w-4 h-4" />,
  },
];

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as AnalyticsTab) || 'overview';
  const [activeTab, setActiveTab] = useState<AnalyticsTab>(
    TABS.some((t) => t.id === initialTab) ? initialTab : 'overview'
  );

  // Per-endpoint filters matching backend query parameters
  const [studentDays, setStudentDays] = useState(30);
  const [studentWeeks, setStudentWeeks] = useState(12);
  const [studentMonths, setStudentMonths] = useState(12);
  const [testDays, setTestDays] = useState(7);
  const [revenueMonths, setRevenueMonths] = useState(6);

  // Per-section state
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalytics | null>(null);
  const [testAnalytics, setTestAnalytics] = useState<TestAnalytics | null>(null);
  const [testSeriesPerf, setTestSeriesPerf] = useState<TestSeriesPerformance | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [studentPerf, setStudentPerf] = useState<StudentPerformanceAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveSectionData = useCallback(async () => {
    switch (activeTab) {
      case 'overview':
        return { tab: 'overview' as const, data: await adminService.getOverviewStats() };
      case 'students':
        return {
          tab: 'students' as const,
          data: await adminService.getStudentAnalytics({
            days: studentDays,
            weeks: studentWeeks,
            months: studentMonths,
          }),
        };
      case 'tests':
        return {
          tab: 'tests' as const,
          data: await adminService.getTestAnalytics({ days: testDays }),
        };
      case 'test-series':
        return {
          tab: 'test-series' as const,
          data: await adminService.getTestSeriesPerformance(),
        };
      case 'revenue':
        return {
          tab: 'revenue' as const,
          data: await adminService.getRevenueAnalytics({ months: revenueMonths }),
        };
      case 'student-performance':
        return {
          tab: 'student-performance' as const,
          data: await adminService.getStudentPerformanceAnalytics(),
        };
    }
  }, [activeTab, studentDays, studentWeeks, studentMonths, testDays, revenueMonths]);

  const applySectionResult = useCallback(
    (result: Awaited<ReturnType<typeof fetchActiveSectionData>>) => {
      switch (result.tab) {
        case 'overview':
          setOverview(result.data);
          break;
        case 'students':
          setStudentAnalytics(result.data);
          break;
        case 'tests':
          setTestAnalytics(result.data);
          break;
        case 'test-series':
          setTestSeriesPerf(result.data);
          break;
        case 'revenue':
          setRevenueAnalytics(result.data);
          break;
        case 'student-performance':
          setStudentPerf(result.data);
          break;
      }
    },
    []
  );

  const loadActiveSection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchActiveSectionData();
      applySectionResult(result);
    } catch (err) {
      console.error(`Failed to load ${activeTab} analytics:`, err);
      setError(getErrorMessage(err, `Failed to load ${activeTab} analytics.`));
    } finally {
      setLoading(false);
    }
  }, [activeTab, fetchActiveSectionData, applySectionResult]);

  useEffect(() => {
    let active = true;
    fetchActiveSectionData()
      .then((result) => {
        if (!active) return;
        applySectionResult(result);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error(`Failed to load ${activeTab} analytics:`, err);
        setError(getErrorMessage(err, `Failed to load ${activeTab} analytics.`));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeTab, fetchActiveSectionData, applySectionResult]);

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-sm text-gray-500">
            Granular metrics powered by dedicated dashboard analytics endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin"
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={loadActiveSection}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      {/* Section Tabs */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-1.5 shadow-xs flex flex-wrap gap-1">
        {TABS.map((tab) => {
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setLoading(true);
                setActiveTab(tab.id);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isCurrent
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadActiveSection}
            className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-semibold text-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200/80 py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
          <p className="text-xs text-gray-500">Fetching analytics section...</p>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && overview && <DashboardStats overview={overview} />}

          {activeTab === 'students' && studentAnalytics && (
            <StudentAnalyticsPanel
              data={studentAnalytics}
              controls={
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select
                    value={studentDays}
                    onChange={(e) => setStudentDays(Number(e.target.value))}
                    aria-label="Daily registration days"
                    className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                  >
                    <option value={7}>Daily: 7d</option>
                    <option value={14}>Daily: 14d</option>
                    <option value={30}>Daily: 30d</option>
                    <option value={60}>Daily: 60d</option>
                  </select>
                  <select
                    value={studentWeeks}
                    onChange={(e) => setStudentWeeks(Number(e.target.value))}
                    aria-label="Weekly registration weeks"
                    className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                  >
                    <option value={4}>Weekly: 4w</option>
                    <option value={12}>Weekly: 12w</option>
                    <option value={24}>Weekly: 24w</option>
                  </select>
                  <select
                    value={studentMonths}
                    onChange={(e) => setStudentMonths(Number(e.target.value))}
                    aria-label="Monthly registration months"
                    className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                  >
                    <option value={6}>Monthly: 6m</option>
                    <option value={12}>Monthly: 12m</option>
                  </select>
                </div>
              }
            />
          )}

          {activeTab === 'tests' && testAnalytics && (
            <TestAnalyticsPanel
              data={testAnalytics}
              controls={
                <select
                  value={testDays}
                  onChange={(e) => setTestDays(Number(e.target.value))}
                  aria-label="Test attempts window"
                  className="px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={14}>Last 14 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={60}>Last 60 days</option>
                </select>
              }
            />
          )}

          {activeTab === 'test-series' && testSeriesPerf && (
            <SeriesPerformancePanel data={testSeriesPerf} />
          )}

          {activeTab === 'revenue' && revenueAnalytics && (
            <RevenueAnalyticsPanel
              data={revenueAnalytics}
              controls={
                <div className="flex items-center gap-2">
                  <select
                    value={revenueMonths}
                    onChange={(e) => setRevenueMonths(Number(e.target.value))}
                    aria-label="Revenue months window"
                    className="px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                  >
                    <option value={3}>Last 3 months</option>
                    <option value={6}>Last 6 months</option>
                    <option value={12}>Last 12 months</option>
                  </select>
                  <Link
                    href="/admin/payments"
                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg"
                  >
                    Manage Payments →
                  </Link>
                </div>
              }
            />
          )}

          {activeTab === 'student-performance' && studentPerf && (
            <StudentPerformancePanel data={studentPerf} />
          )}
        </>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <AnalyticsContent />
    </Suspense>
  );
}

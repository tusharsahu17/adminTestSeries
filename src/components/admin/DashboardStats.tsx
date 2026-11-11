import React from 'react';
import {
  Activity,
  BookOpen,
  ClipboardCheck,
  FileText,
  HelpCircle,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { OverviewStats } from '../../types/admin/analytics';
import { formatCompactNumber, formatINR, formatPercent } from '../../utils/formatters';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  growthPercent?: number | null;
  icon: React.ReactNode;
  accentClass?: string;
  badges?: Array<{ label: string; value: number | string; className?: string }>;
}

export function StatCard({
  title,
  value,
  subtitle,
  growthPercent,
  icon,
  accentClass = 'bg-indigo-50 text-indigo-600',
  badges,
}: StatCardProps) {
  const hasGrowth = growthPercent !== null && growthPercent !== undefined;
  const isPositive = (growthPercent ?? 0) >= 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accentClass}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        {subtitle ? <span className="text-gray-500">{subtitle}</span> : <span />}
        {hasGrowth && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${
              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}
            {formatPercent(growthPercent)}
          </span>
        )}
      </div>

      {badges && badges.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <span
              key={b.label}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                b.className || 'bg-gray-100 text-gray-700'
              }`}
            >
              <span>{b.label}:</span>
              <strong className="font-semibold">{b.value}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface DashboardStatsProps {
  overview: OverviewStats;
  compact?: boolean;
}

export default function DashboardStats({ overview, compact = false }: DashboardStatsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={formatCompactNumber(overview.totalStudents)}
          subtitle={`+${formatCompactNumber(overview.studentsThisMonth)} this month`}
          growthPercent={overview.studentsMomGrowthPercent}
          icon={<Users className="w-5 h-5" />}
          accentClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Total Revenue (INR)"
          value={formatINR(overview.totalRevenue)}
          subtitle="MoM revenue growth"
          growthPercent={overview.revenueGrowthPercent}
          icon={<IndianRupee className="w-5 h-5" />}
          accentClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Test Attempts"
          value={formatCompactNumber(overview.totalTestAttempts)}
          subtitle="Across all published tests"
          growthPercent={overview.attemptsGrowthPercent}
          icon={<ClipboardCheck className="w-5 h-5" />}
          accentClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Test Series"
          value={formatCompactNumber(overview.totalTestSeries)}
          subtitle={`+${formatCompactNumber(overview.testSeriesAddedThisMonth)} added this month`}
          icon={<BookOpen className="w-5 h-5" />}
          accentClass="bg-violet-50 text-violet-600"
        />
      </div>

      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Tests"
            value={formatCompactNumber(overview.totalTests)}
            icon={<FileText className="w-5 h-5" />}
            accentClass="bg-amber-50 text-amber-600"
            badges={[
              {
                label: 'Published',
                value: formatCompactNumber(overview.publishedTests),
                className: 'bg-emerald-50 text-emerald-700',
              },
              {
                label: 'Draft',
                value: formatCompactNumber(overview.draftTests),
                className: 'bg-gray-100 text-gray-700',
              },
              {
                label: 'Scheduled',
                value: formatCompactNumber(overview.scheduledTests),
                className: 'bg-amber-50 text-amber-700',
              },
            ]}
          />
          <StatCard
            title="Question Bank"
            value={formatCompactNumber(overview.totalQuestions)}
            subtitle="Total questions available"
            icon={<HelpCircle className="w-5 h-5" />}
            accentClass="bg-cyan-50 text-cyan-600"
          />
          <StatCard
            title="Active Students (30d)"
            value={formatCompactNumber(overview.activeStudents30Days)}
            subtitle="Active within the last 30 days"
            icon={<Activity className="w-5 h-5" />}
            accentClass="bg-rose-50 text-rose-600"
          />
        </div>
      )}
    </div>
  );
}

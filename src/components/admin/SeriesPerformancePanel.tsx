'use client';

import React, { useMemo, useState } from 'react';
import { Award, BookOpen, Calendar, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { SeriesPerformanceItem, TestSeriesPerformance } from '../../types/admin/analytics';
import { formatCompactNumber, formatDate, formatINR, formatPercent } from '../../utils/formatters';

interface SeriesPerformancePanelProps {
  data: TestSeriesPerformance;
  compact?: boolean;
}

interface HighlightCardConfig {
  label: string;
  item: SeriesPerformanceItem | null;
  metricText: (item: SeriesPerformanceItem) => string;
  icon: React.ReactNode;
  accent: string;
}

export default function SeriesPerformancePanel({
  data,
  compact = false,
}: SeriesPerformancePanelProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<
    'enrolled' | 'attempts' | 'completionRate' | 'totalRevenue'
  >('enrolled');

  const highlightCards: HighlightCardConfig[] = [
    {
      label: 'Most Popular',
      item: data.highlights.mostPopularTestSeries,
      metricText: (s) => `${formatCompactNumber(s.enrolled)} enrolled`,
      icon: <TrendingUp className="w-4 h-4" />,
      accent: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
    {
      label: 'Highest Revenue',
      item: data.highlights.highestRevenueSeries,
      metricText: (s) => formatINR(s.totalRevenue),
      icon: <Award className="w-4 h-4" />,
      accent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      label: 'Highest Completion',
      item: data.highlights.highestCompletionRateSeries,
      metricText: (s) => formatPercent(s.completionRate),
      icon: <BookOpen className="w-4 h-4" />,
      accent: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      label: 'Least Popular',
      item: data.highlights.leastPopularTestSeries,
      metricText: (s) => `${formatCompactNumber(s.enrolled)} enrolled`,
      icon: <TrendingDown className="w-4 h-4" />,
      accent: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      label: 'Recently Published',
      item: data.highlights.recentlyPublishedSeries,
      metricText: (s) => (s.publishedAt ? formatDate(s.publishedAt) : 'Published'),
      icon: <Calendar className="w-4 h-4" />,
      accent: 'bg-violet-50 text-violet-700 border-violet-100',
    },
  ];

  const filteredSeries = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? data.series.filter((s) => s.title.toLowerCase().includes(q))
      : [...data.series];
    return base.sort((a, b) => Number(b[sortField]) - Number(a[sortField]));
  }, [data.series, search, sortField]);

  const visibleHighlights = compact ? highlightCards.slice(0, 4) : highlightCards;

  return (
    <div className="space-y-5">
      {/* Highlights */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${compact ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-3`}>
        {visibleHighlights.map((h) => (
          <div
            key={h.label}
            className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                {h.label}
              </span>
              <span className={`p-1.5 rounded-lg border ${h.accent}`}>{h.icon}</span>
            </div>
            {h.item ? (
              <div>
                <p className="text-sm font-bold text-gray-900 truncate" title={h.item.title}>
                  {h.item.title}
                </p>
                <p className="text-xs font-semibold text-indigo-600 mt-1">{h.metricText(h.item)}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No data yet</p>
            )}
          </div>
        ))}
      </div>

      {/* Series Table + Recently Published */}
      <div className={`grid grid-cols-1 ${!compact ? 'xl:grid-cols-3' : ''} gap-5`}>
        <div
          className={`bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden ${
            !compact ? 'xl:col-span-2' : ''
          }`}
        >
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Test Series Performance</h3>
              <p className="text-xs text-gray-500">
                Enrollment, test attempts, completion rate, and INR revenue per series
              </p>
            </div>
            {!compact && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filter series..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <select
                  value={sortField}
                  onChange={(e) =>
                    setSortField(
                      e.target.value as
                        | 'enrolled'
                        | 'attempts'
                        | 'completionRate'
                        | 'totalRevenue'
                    )
                  }
                  className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                >
                  <option value="enrolled">Sort: Enrolled</option>
                  <option value="attempts">Sort: Attempts</option>
                  <option value="completionRate">Sort: Completion %</option>
                  <option value="totalRevenue">Sort: Revenue</option>
                </select>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70">
                  <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Series Title
                  </th>
                  <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">
                    Enrolled
                  </th>
                  <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">
                    Attempts
                  </th>
                  <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">
                    Completed
                  </th>
                  <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Completion Rate
                  </th>
                  <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredSeries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-400">
                      No test series performance records found.
                    </td>
                  </tr>
                ) : (
                  filteredSeries.map((s, idx) => (
                    <tr key={`${s.id ?? s.title}-${idx}`} className="hover:bg-gray-50/60">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                            {s.title.charAt(0).toUpperCase()}
                          </span>
                          <span className="truncate max-w-[220px]" title={s.title}>
                            {s.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 font-medium">
                        {formatCompactNumber(s.enrolled)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatCompactNumber(s.attempts)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatCompactNumber(s.completedAttempts)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, s.completionRate))}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700">
                            {formatPercent(s.completionRate)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        {formatINR(s.totalRevenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!compact && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5">
            <h3 className="text-base font-bold text-gray-900 mb-1">Recently Published Series</h3>
            <p className="text-xs text-gray-500 mb-4">
              Latest published series tracked via <code className="text-[11px]">published_at</code>
            </p>
            {data.recentlyPublishedSeries.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                No recently published series found.
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentlyPublishedSeries.map((item, idx) => (
                  <div
                    key={`recent-${item.id ?? item.title}-${idx}`}
                    className="p-3 rounded-lg border border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Published: {item.publishedAt ? formatDate(item.publishedAt) : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-indigo-600">
                        {formatCompactNumber(item.enrolled)} enrolled
                      </p>
                      <p className="text-[11px] text-gray-500">{formatINR(item.totalRevenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


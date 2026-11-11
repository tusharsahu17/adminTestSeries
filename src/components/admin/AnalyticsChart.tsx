'use client';

import React from 'react';

export interface AnalyticsBarItem {
  label: string;
  value: number;
  secondaryValue?: number;
  tooltip?: string;
}

interface AnalyticsChartProps {
  title: string;
  subtitle?: string;
  items: AnalyticsBarItem[];
  valueFormatter?: (value: number) => string;
  barColorClass?: string;
  secondaryColorClass?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  headerAction?: React.ReactNode;
  emptyMessage?: string;
  heightClass?: string;
}

export default function AnalyticsChart({
  title,
  subtitle,
  items,
  valueFormatter = (v) => v.toLocaleString('en-IN'),
  barColorClass = 'bg-indigo-500 hover:bg-indigo-600',
  secondaryColorClass = 'bg-emerald-400',
  primaryLabel,
  secondaryLabel,
  headerAction,
  emptyMessage = 'No data available for this range.',
  heightClass = 'h-56',
}: AnalyticsChartProps) {
  const maxVal = Math.max(
    1,
    ...items.map((item) => Math.max(item.value, item.secondaryValue ?? 0))
  );

  // Reduce label clutter when displaying 20-30+ bars
  const labelStep = items.length > 20 ? Math.ceil(items.length / 8) : items.length > 12 ? 2 : 1;

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {(primaryLabel || secondaryLabel) && (
            <div className="flex items-center gap-3 text-xs text-gray-600">
              {primaryLabel && (
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-xs ${barColorClass.split(' ')[0]}`} />
                  {primaryLabel}
                </span>
              )}
              {secondaryLabel && (
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-xs ${secondaryColorClass.split(' ')[0]}`} />
                  {secondaryLabel}
                </span>
              )}
            </div>
          )}
          {headerAction}
        </div>
      </div>

      {items.length === 0 ? (
        <div className={`${heightClass} flex items-center justify-center text-sm text-gray-400 bg-gray-50/70 rounded-lg border border-dashed border-gray-200`}>
          {emptyMessage}
        </div>
      ) : (
        <div>
          <div className={`${heightClass} flex items-end gap-1.5 pt-6 pb-1 px-2 border-b border-gray-200`}>
            {items.map((item, idx) => {
              const primaryPct = item.value > 0 ? Math.max(6, Math.round((item.value / maxVal) * 100)) : 2;
              const hasSecondary = item.secondaryValue !== undefined;
              const secondaryPct =
                hasSecondary && (item.secondaryValue ?? 0) > 0
                  ? Math.max(6, Math.round(((item.secondaryValue ?? 0) / maxVal) * 100))
                  : 0;
              const tooltipText =
                item.tooltip ||
                `${item.label}: ${valueFormatter(item.value)}${
                  hasSecondary ? ` (${secondaryLabel || 'Completed'}: ${valueFormatter(item.secondaryValue ?? 0)})` : ''
                }`;

              return (
                <div
                  key={`${item.label}-${idx}`}
                  className="flex-1 h-full flex items-end justify-center gap-0.5 group relative"
                  title={tooltipText}
                >
                  <div
                    className={`w-full max-w-[28px] rounded-t-sm transition-all ${
                      item.value > 0 ? barColorClass : 'bg-gray-200'
                    }`}
                    style={{ height: `${primaryPct}%` }}
                  />
                  {hasSecondary && (
                    <div
                      className={`w-full max-w-[16px] rounded-t-sm transition-all ${
                        (item.secondaryValue ?? 0) > 0 ? secondaryColorClass : 'bg-gray-100'
                      }`}
                      style={{ height: `${secondaryPct}%` }}
                    />
                  )}
                  <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-[11px] rounded-md px-2 py-1 whitespace-nowrap z-20 shadow-md">
                    {tooltipText}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 px-2 pt-2">
            {items.map((item, idx) => (
              <div
                key={`lbl-${item.label}-${idx}`}
                className="flex-1 text-center text-[11px] text-gray-500 truncate"
                title={item.label}
              >
                {idx % labelStep === 0 || idx === items.length - 1 ? item.label : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

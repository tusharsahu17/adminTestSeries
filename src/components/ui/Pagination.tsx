'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  limit?: number;
  itemCount?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function Pagination({
  page,
  totalPages,
  total,
  limit = 10,
  itemCount = 0,
  itemLabel = 'items',
  onPageChange,
  loading = false,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);

  const startIndex = total === 0 || itemCount === 0 ? 0 : (safePage - 1) * limit + 1;
  const endIndex = total !== undefined ? Math.min(total, startIndex + Math.max(0, itemCount - 1)) : startIndex + Math.max(0, itemCount - 1);

  const pageNumbers: number[] = [];
  const startPage = Math.max(1, safePage - 2);
  const endPage = Math.min(safeTotalPages, startPage + 4);
  for (let p = Math.max(1, endPage - 4); p <= endPage; p++) {
    pageNumbers.push(p);
  }

  return (
    <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 bg-white">
      <div>
        {total !== undefined ? (
          total === 0 ? (
            <span>No {itemLabel}</span>
          ) : (
            <span>
              Showing <strong className="text-gray-700">{startIndex}</strong>–
              <strong className="text-gray-700">{endIndex}</strong> of{' '}
              <strong className="text-gray-700">{total}</strong> {itemLabel}
            </span>
          )
        ) : (
          <span>
            Page <strong className="text-gray-700">{safePage}</strong> of{' '}
            <strong className="text-gray-700">{safeTotalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={loading || safePage <= 1}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md font-medium text-gray-700 disabled:opacity-45 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </button>

        {pageNumbers.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onPageChange(num)}
            disabled={loading}
            className={`min-w-[28px] px-2 py-1.5 rounded-md font-semibold transition-colors ${
              num === safePage
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={loading || safePage >= safeTotalPages}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md font-medium text-gray-700 disabled:opacity-45 disabled:pointer-events-none transition-colors"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

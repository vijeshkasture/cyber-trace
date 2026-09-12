import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pager({ page, pageSize, total, onPageChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) {
    return (
      <p className="text-xs text-police-textDim font-mono">
        {total} record{total === 1 ? '' : 's'}
      </p>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 text-xs text-police-textMuted">
      <span className="font-mono">
        {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-1 border border-police-border bg-white disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-2 font-mono">
          {page} / {pages}
        </span>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className="p-1 border border-police-border bg-white disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

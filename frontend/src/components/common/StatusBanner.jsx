import React from 'react';
import { STATE_COPY } from '../../utils/investigationState';

export default function StatusBanner({ state }) {
  const copy = STATE_COPY[state];
  if (!copy) return null;

  const tone =
    state === 'ANALYSIS_COMPLETE_FINDINGS'
      ? 'border-orange-200 bg-orange-50 text-orange-900'
      : state === 'CASE_HAS_NO_EVIDENCE' || state === 'READY_FOR_ANALYSIS'
        ? 'border-blue-200 bg-blue-50 text-blue-900'
        : state === 'PROCESSING'
          ? 'border-slate-300 bg-slate-100 text-slate-800'
          : 'border-police-border bg-white text-police-text';

  return (
    <div className={`border px-3 py-2 mb-4 text-sm ${tone}`}>
      <span className="font-semibold">{copy.label}.</span>{' '}
      <span className="text-current/80">{copy.detail}</span>
    </div>
  );
}

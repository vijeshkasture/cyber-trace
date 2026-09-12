import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Unable to load investigation data',
  message = 'The workstation could not reach the local FastAPI vault.',
  onRetry,
}) {
  return (
    <div className="border border-police-criticalBorder bg-police-criticalBg rounded-md p-6 text-center">
      <AlertTriangle className="w-6 h-6 text-police-critical mx-auto mb-2" />
      <h3 className="text-base font-semibold text-police-text">{title}</h3>
      <p className="text-sm text-police-textMuted mt-1 max-w-lg mx-auto">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 border border-police-border bg-white text-sm font-semibold text-police-text hover:bg-police-subtle"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}

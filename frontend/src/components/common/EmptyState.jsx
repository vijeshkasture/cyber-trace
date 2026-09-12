import React from 'react';
import { FolderSearch, Plus, RefreshCw } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FolderSearch,
  title = 'No records found',
  description = 'No evidentiary data is registered for this view in the SQLite vault.',
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white border border-dashed border-police-border rounded-md my-4">
      <div className="w-12 h-12 rounded-full bg-police-subtle border border-police-border flex items-center justify-center text-police-textMuted mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-police-text mb-1">{title}</h3>
      <p className="text-sm text-police-textDim max-w-md mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-police-accent hover:bg-police-accentHover text-white text-xs font-semibold rounded transition-colors"
        >
          <ActionIcon className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

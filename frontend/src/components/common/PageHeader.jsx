import React from 'react';

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 mb-4 border-b border-police-border">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-police-navy">{title}</h1>
        {subtitle && (
          <p className="text-sm text-police-textMuted mt-1 max-w-3xl leading-relaxed">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

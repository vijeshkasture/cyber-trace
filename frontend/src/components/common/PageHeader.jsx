import React from 'react';

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-police-border pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[1.65rem] font-semibold tracking-[-0.03em] text-police-navy sm:text-2xl">{title}</h1>
        {subtitle && (
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-police-textMuted">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">{actions}</div>}
    </div>
  );
}

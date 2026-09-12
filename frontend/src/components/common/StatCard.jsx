import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'default',
  accentColor = 'text-police-accent'
}) {
  return (
    <div className="bg-white border border-police-border rounded-md p-4 transition-colors hover:border-police-borderStrong">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-[11px] font-medium text-police-textDim tracking-[0.02em]">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded border border-police-border bg-police-subtle flex items-center justify-center text-police-textDim">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="text-[28px] leading-none font-semibold tracking-[-0.05em] text-police-text tabular-nums">
          {value !== undefined && value !== null ? value : '—'}
        </div>
        {badge && (
          <span className={`inline-flex items-center text-[10px] px-2 py-1 rounded border font-medium ${
            badgeType === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
            badgeType === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
            badgeType === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-police-textDim leading-relaxed truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}

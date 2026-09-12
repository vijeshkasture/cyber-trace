import React from 'react';
import { getSeverityClasses } from '../../utils/formatters';

export default function SeverityBadge({ severity, className = '' }) {
  const classes = getSeverityClasses(severity);
  const text = String(severity || 'LOW').toUpperCase();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium tracking-[0.08em] border ${classes.badge} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${classes.dot}`} />
      {text}
    </span>
  );
}

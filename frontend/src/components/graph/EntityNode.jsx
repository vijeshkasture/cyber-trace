import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

function severityBorder(severity) {
  const s = String(severity || '').toUpperCase();
  if (s === 'CRITICAL') return 'border-red-600';
  if (s === 'HIGH') return 'border-orange-600';
  if (s === 'MED' || s === 'MEDIUM') return 'border-amber-600';
  return 'border-slate-400';
}

function EntityNode({ data, selected }) {
  return (
    <div
      className={`min-w-[160px] max-w-[220px] bg-white border-2 ${severityBorder(data.severity)} ${
        selected ? 'ring-2 ring-police-accent ring-offset-1' : ''
      } px-2.5 py-2 shadow-sm`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2 !border-0" />
      <p className="text-[10px] uppercase tracking-wide text-police-textDim font-semibold">
        {data.type}
      </p>
      <p className="text-xs font-mono font-semibold text-police-navy truncate" title={data.label}>
        {data.label}
      </p>
      <p className="text-[11px] text-police-textMuted mt-0.5">
        Risk {data.risk} · {data.severity || 'LOW'}
      </p>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2 !border-0" />
    </div>
  );
}

export default memo(EntityNode);

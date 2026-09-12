import React from 'react';
import { ShieldAlert } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge.jsx';
import TransactionChain from './TransactionChain.jsx';

export default function FindingsPanel({ analyzed, findings, loading }) {
  if (loading) return null;

  if (!analyzed) {
    return (
      <div className="border border-police-border bg-white p-4 mb-4 rounded-md">
        <h2 className="text-lg font-semibold text-police-navy mb-1">Investigation findings</h2>
        <p className="text-sm text-police-textMuted leading-relaxed">
          <span className="font-semibold text-police-text">Not analyzed.</span> Run analysis to
          detect rapid forwarding, shared devices, fan-in, and multi-hop chains.
        </p>
      </div>
    );
  }

  if (!findings || findings.length === 0) {
    return (
      <div className="border border-police-border bg-white p-4 mb-4 rounded-md">
        <h2 className="text-lg font-semibold text-police-navy mb-1">Investigation findings</h2>
        <p className="text-sm text-police-textMuted leading-relaxed">
          <span className="font-semibold text-police-text">Analysis complete. No findings detected.</span> The
          correlation engine recorded no suspicious patterns for this case.
        </p>
      </div>
    );
  }

  return (
    <section className="mb-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold text-police-navy">
          Investigation findings
        </h2>
        <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-orange-800 bg-orange-50 border border-orange-200 px-2 py-1 rounded">
          {findings.length} findings
        </span>
      </div>
      <div className="space-y-3">
        {findings.map((item) => (
          <article
            key={item.id}
            className="bg-white border border-police-border p-4 rounded-md"
          >
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="w-4 h-4 text-police-textMuted" />
                  <h3 className="text-base font-semibold text-police-navy">{item.title}</h3>
                </div>
                <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-police-textDim">
                  {item.pattern_type}
                </p>
              </div>
              <SeverityBadge severity={item.severity} />
            </div>
            <p className="text-sm text-police-textMuted mb-3 leading-relaxed">{item.explanation || item.flow_summary}</p>
            <TransactionChain summary={item.flow_summary} />
            <dl className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded border border-police-border bg-police-subtle p-2">
                <dt className="text-police-textDim">Interval / latency</dt>
                <dd className="mt-1 font-medium text-police-text">{item.latency_info || '—'}</dd>
              </div>
              <div className="rounded border border-police-border bg-police-subtle p-2">
                <dt className="text-police-textDim">Evidence</dt>
                <dd className="mt-1 font-medium text-police-text break-words">{item.source_ref || '—'}</dd>
              </div>
              <div className="rounded border border-police-border bg-police-subtle p-2">
                <dt className="text-police-textDim">Type</dt>
                <dd className="mt-1 font-medium text-police-text">{item.pattern_type}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

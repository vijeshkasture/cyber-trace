import React from 'react';
import { ArrowDown } from 'lucide-react';

function parseHops(summary) {
  if (!summary) return [];
  return summary
    .split(/\s*(?:➔|->|→|=>)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function TransactionChain({ summary }) {
  const hops = parseHops(summary);
  if (hops.length < 2) {
    if (!summary) return null;
    return (
      <p className="text-xs font-mono text-police-text bg-police-subtle border border-police-border px-2 py-1.5">
        {summary}
      </p>
    );
  }

  return (
    <div className="bg-police-subtle border border-police-border px-3 py-3">
      <p className="text-[11px] uppercase tracking-wide text-police-textDim mb-2">
        Transaction chain · {hops.length - 1} hop{hops.length - 1 === 1 ? '' : 's'}
      </p>
      <ol className="space-y-0">
        {hops.map((hop, idx) => (
          <li key={`${hop}-${idx}`} className="flex flex-col items-start">
            <div className="border border-police-border bg-white px-2.5 py-1.5 text-sm font-mono text-police-navy w-full">
              {hop}
            </div>
            {idx < hops.length - 1 && (
              <ArrowDown className="w-3.5 h-3.5 text-police-textDim my-1 ml-3" aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

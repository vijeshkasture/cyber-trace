import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, Share2, Clock, FileCheck, X, ArrowRight, ExternalLink, Hash } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';
import { truncateHash } from '../../utils/formatters';

export default function EntityDossier({ entity, onClose, caseId }) {
  const navigate = useNavigate();

  if (!entity) {
    return (
      <div className="bg-white border border-police-border rounded-md p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <div className="w-12 h-12 rounded-full bg-police-subtle border border-police-border flex items-center justify-center text-police-textDim mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-police-text">No entity selected</h4>
        <p className="text-xs text-police-textDim max-w-xs mt-2 leading-relaxed">
          Select any entity from the risk assessment table or network graph to review its forensic dossier and behavioral telemetry.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-police-border rounded-md flex flex-col h-full overflow-hidden">
      {/* Dossier Header */}
      <div className="p-4 border-b border-police-border bg-police-subtle flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium tracking-[0.08em] uppercase bg-police-border text-police-textMuted font-mono">
              {entity.type}
            </span>
            <SeverityBadge severity={entity.severity} />
          </div>
          <h3 className="text-base font-semibold text-police-text truncate" title={entity.id}>
            {entity.id}
          </h3>
          {entity.institution && (
            <p className="text-xs text-police-textDim truncate mt-1">{entity.institution}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-medium text-police-textDim uppercase tracking-[0.08em]">Risk score</div>
            <div className={`text-[28px] leading-none font-semibold tracking-[-0.05em] ${
              entity.score >= 80 ? 'text-red-600' :
              entity.score >= 60 ? 'text-orange-600' :
              entity.score >= 40 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {entity.score}<span className="text-xs text-police-textDim font-medium"> / 100</span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-police-textDim hover:text-police-text p-1 rounded transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Quick Actions */}
      <div className="grid grid-cols-3 border-b border-police-border bg-slate-50 divide-x divide-police-border text-xs font-semibold">
        <button
          onClick={() => navigate(`/cases/${caseId}/graph`)}
          className="py-2 px-3 text-police-textMuted hover:text-police-accent hover:bg-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Graph
        </button>
        <button
          onClick={() => navigate(`/cases/${caseId}/timeline`)}
          className="py-2 px-3 text-police-textMuted hover:text-police-accent hover:bg-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <Clock className="w-3.5 h-3.5" />
          Timeline
        </button>
        <button
          onClick={() => navigate(`/cases/${caseId}/evidence`)}
          className="py-2 px-3 text-police-textMuted hover:text-police-accent hover:bg-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <FileCheck className="w-3.5 h-3.5" />
          Evidence
        </button>
      </div>

      {/* Dossier Content */}
      <div className="p-4 space-y-5 overflow-y-auto flex-1 text-xs">
        {/* Telemetry Metadata */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-police-textDim mb-2">
            Observation Window
          </h4>
          <div className="grid grid-cols-2 gap-2 bg-police-subtle border border-police-border rounded p-2.5">
            <div>
              <span className="text-police-textDim block text-[10px]">First Activity:</span>
              <span className="font-mono text-police-text font-medium">{entity.firstSeen || '—'}</span>
            </div>
            <div>
              <span className="text-police-textDim block text-[10px]">Last Activity:</span>
              <span className="font-mono text-police-text font-medium">{entity.lastActive || '—'}</span>
            </div>
          </div>
        </div>

        {/* Risk Breakdown / Weights */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-police-textDim mb-2 flex items-center justify-between">
            <span>Risk Factor Breakdown</span>
            <span className="font-mono text-police-textMuted">{entity.factors?.length || 0} Flags</span>
          </h4>
          {entity.weights && entity.weights.length > 0 ? (
            <div className="space-y-1.5">
              {entity.weights.map((w, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-police-subtle border border-police-border rounded">
                  <span className="text-police-text font-medium">{w.label}</span>
                  <span className="font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[11px]">
                    {w.pts}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 border border-police-border rounded text-police-textDim">
              No elevated risk factors detected for this entity.
            </div>
          )}
        </div>

        {/* Connected Entities / Topology */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-police-textDim mb-2 flex items-center justify-between">
            <span>Connected Relational Links</span>
            <span className="font-mono text-police-textMuted">{entity.nodes || 0} Nodes</span>
          </h4>
          {entity.topology && entity.topology.length > 0 ? (
            <div className="space-y-1.5">
              {entity.topology.map((top, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-police-subtle border border-police-border rounded">
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-police-text block truncate">{top.val}</span>
                    <span className="text-[10px] text-police-textDim">{top.label}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-police-accent border border-blue-200 shrink-0">
                    LINKED
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 border border-police-border rounded text-police-textDim">
              No correlated links registered.
            </div>
          )}
        </div>

        {/* Source Evidence References with SHA-256 */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-police-textDim mb-2">
            Evidentiary Provenance
          </h4>
          {entity.sources && entity.sources.length > 0 ? (
            <div className="space-y-2">
              {entity.sources.map((src, idx) => (
                <div key={idx} className="p-2.5 bg-police-subtle border border-police-border rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-police-text truncate">{src.file}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                      {src.match || 'REFERENCED'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-police-textDim break-all">
                    SHA-256: {src.hash}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 border border-police-border rounded text-police-textDim">
              No evidence references available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

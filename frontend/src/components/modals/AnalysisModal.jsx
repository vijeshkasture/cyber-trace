import React from 'react';
import { X, Play, CheckCircle2, AlertCircle, Loader2, Clock, FileText, Users, Share2, ShieldAlert } from 'lucide-react';

export default function AnalysisModal({ isOpen, onClose, isAnalyzing, result, error, caseId }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="bg-white border border-police-border rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-police-border bg-police-subtle">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-police-accent fill-police-accent" />
            <div>
              <h2 className="text-sm font-bold text-police-text">Forensic Intelligence Pipeline</h2>
              <p className="text-xs text-police-textDim font-mono">Target Case: {caseId}</p>
            </div>
          </div>
          {!isAnalyzing && (
            <button
              onClick={onClose}
              className="text-police-textDim hover:text-police-text p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-slate-200 border-t-police-accent animate-spin" />
                <Play className="w-5 h-5 text-police-accent absolute inset-0 m-auto" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-police-text">Executing Analytical Engines</h3>
                <p className="text-xs text-police-textDim mt-1 max-w-xs leading-relaxed">
                  Parsing evidence files, extracting cross-silo entities, correlating shared devices/IPs, and computing risk topologies...
                </p>
              </div>
              <div className="w-full max-w-xs bg-slate-100 border border-slate-200 rounded p-2.5 text-[11px] text-police-textMuted font-mono text-left space-y-1">
                <div className="text-police-accent font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-police-accent animate-ping" />
                  Running rule-based correlation...
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Analysis Pipeline Failed</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-police-subtle border border-police-border hover:bg-slate-200 text-police-text text-xs font-semibold rounded transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {!isAnalyzing && result && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Forensic analysis pipeline completed successfully.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-police-subtle border border-police-border rounded">
                  <div className="flex items-center gap-1.5 text-xs text-police-textDim font-medium mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    Files Processed
                  </div>
                  <div className="text-xl font-bold font-mono text-police-text">
                    {result.files_processed}
                  </div>
                </div>

                <div className="p-3 bg-police-subtle border border-police-border rounded">
                  <div className="flex items-center gap-1.5 text-xs text-police-textDim font-medium mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    Raw Records
                  </div>
                  <div className="text-xl font-bold font-mono text-police-text">
                    {result.records_processed}
                  </div>
                </div>

                <div className="p-3 bg-police-subtle border border-police-border rounded">
                  <div className="flex items-center gap-1.5 text-xs text-police-textDim font-medium mb-1">
                    <Users className="w-3.5 h-3.5" />
                    Entities Identified
                  </div>
                  <div className="text-xl font-bold font-mono text-police-text">
                    {result.entities_identified}
                  </div>
                </div>

                <div className="p-3 bg-police-subtle border border-police-border rounded">
                  <div className="flex items-center gap-1.5 text-xs text-police-textDim font-medium mb-1">
                    <Share2 className="w-3.5 h-3.5" />
                    Correlated Links
                  </div>
                  <div className="text-xl font-bold font-mono text-police-text">
                    {result.relationships_identified}
                  </div>
                </div>

                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center gap-1.5 text-xs text-red-800 font-medium mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    High Risk Entities
                  </div>
                  <div className="text-xl font-bold font-mono text-red-700">
                    {result.high_risk_entities}
                  </div>
                </div>

                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="flex items-center gap-1.5 text-xs text-orange-800 font-medium mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Anomalies Detected
                  </div>
                  <div className="text-xl font-bold font-mono text-orange-700">
                    {result.anomalies_detected}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-police-textDim pt-2 border-t border-police-border">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Execution Time: <span className="font-mono font-semibold text-police-text">{result.processing_time_seconds}s</span></span>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-police-accent hover:bg-police-accentHover text-white text-xs font-semibold rounded shadow-sm transition-colors"
                >
                  View Updated Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

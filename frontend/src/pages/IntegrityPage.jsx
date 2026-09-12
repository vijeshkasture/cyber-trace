import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { evidenceService } from '../services/evidenceService.js';
import { integrityService } from '../services/integrityService.js';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import useAsyncResource from '../hooks/useAsyncResource.js';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { formatDate } from '../utils/formatters.js';

function statusLabel(row, verifiedMap) {
  const result = verifiedMap[row.id];
  if (!result) return { text: 'NOT VERIFIED', className: 'text-police-textMuted bg-slate-100 border-slate-200' };
  if (result.pending) return { text: 'PENDING', className: 'text-slate-700 bg-slate-100 border-slate-200' };
  if (result.match === true) return { text: 'VERIFIED', className: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
  return { text: 'MISMATCH', className: 'text-red-800 bg-red-50 border-red-200' };
}

export default function IntegrityPage() {
  const { caseId } = useParams();
  const { refreshKey } = useInvestigation();
  const evidence = useAsyncResource(() => evidenceService.getEvidence(caseId), [caseId, refreshKey]);
  const [verified, setVerified] = useState({});
  const [caseResult, setCaseResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const runVerifyAll = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await integrityService.verifyCaseIntegrity(caseId);
      setCaseResult(result);
      const next = {};
      (result.verifications || []).forEach((v) => {
        next[v.evidence_id] = v;
      });
      setVerified(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const runVerifyOne = async (evidenceId) => {
    setVerified((prev) => ({ ...prev, [evidenceId]: { ...(prev[evidenceId] || {}), pending: true } }));
    try {
      const result = await integrityService.verifySingleEvidence(caseId, evidenceId);
      setVerified((prev) => ({ ...prev, [evidenceId]: result }));
    } catch (err) {
      setError(err.message);
      setVerified((prev) => {
        const copy = { ...prev };
        delete copy[evidenceId];
        return copy;
      });
    }
  };

  if (evidence.loading) return <LoadingSpinner text="Loading chain of custody..." />;
  if (evidence.error) return <ErrorState message={evidence.error} onRetry={evidence.reload} />;

  return (
    <div>
      <PageHeader
        title="Chain of custody"
        subtitle="SHA-256 values shown as stored were computed at upload. VERIFIED is shown only after the backend compares the current file hash."
        actions={
          <button
            type="button"
            onClick={runVerifyAll}
            disabled={busy || !evidence.data?.length}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-police-navy text-white text-sm font-semibold disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            {busy ? 'Verifying…' : 'Verify integrity'}
          </button>
        }
      />

      {error && (
        <div className="mb-3 border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2">{error}</div>
      )}

      {caseResult && (
        <p className="mb-3 text-sm">
          Case {caseResult.case_id}:{' '}
          <span className="font-semibold">
            {caseResult.all_match ? 'All stored hashes match current files.' : 'One or more files failed verification.'}
          </span>
        </p>
      )}

      {!evidence.data || evidence.data.length === 0 ? (
        <EmptyState
          icon={Lock}
          title="No evidence in custody"
          description="Upload files before SHA-256 verification can run."
        />
      ) : (
        <div className="space-y-3">
          {evidence.data.map((ev) => {
            const v = verified[ev.id];
            const badge = statusLabel(ev, verified);
            return (
              <article key={ev.id} className="bg-white border border-police-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-serif font-bold text-police-navy">{ev.original_filename}</h3>
                    <p className="text-xs font-mono text-police-textDim">Evidence ID {ev.id}</p>
                    <p className="text-xs text-police-textMuted mt-0.5">Uploaded {formatDate(ev.upload_timestamp)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 border ${badge.className}`}>
                      {badge.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => runVerifyOne(ev.id)}
                      className="text-xs font-semibold border border-police-border px-2 py-1 bg-white hover:bg-police-subtle"
                    >
                      Verify file
                    </button>
                  </div>
                </div>
                <dl className="grid grid-cols-1 gap-2 text-xs">
                  <div>
                    <dt className="text-police-textDim uppercase tracking-wide">Stored hash</dt>
                    <dd className="font-mono break-all text-police-navy mt-0.5">{ev.sha256_hash}</dd>
                  </div>
                  <div>
                    <dt className="text-police-textDim uppercase tracking-wide">Current hash</dt>
                    <dd className="font-mono break-all text-police-navy mt-0.5">
                      {v && !v.pending ? v.current_hash : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-police-textDim uppercase tracking-wide">Match result</dt>
                    <dd className="font-semibold mt-0.5">
                      {v && !v.pending ? (v.match ? 'MATCH' : 'NO MATCH') : 'Awaiting verification'}
                    </dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { relationshipService } from '../services/relationshipService.js';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import useAsyncResource from '../hooks/useAsyncResource.js';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Pager from '../components/common/Pager.jsx';
import { formatDate } from '../utils/formatters.js';

const PAGE_SIZE = 50;

export default function RelationshipsPage() {
  const { caseId } = useParams();
  const { refreshKey } = useInvestigation();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data, loading, error, reload } = useAsyncResource(
    () => relationshipService.getRelationships(caseId),
    [caseId, refreshKey]
  );

  const types = useMemo(() => {
    const set = new Set((data || []).map((r) => r.relationship_type).filter(Boolean));
    return ['ALL', ...Array.from(set).sort()];
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || []).filter((row) => {
      if (typeFilter !== 'ALL' && row.relationship_type !== typeFilter) return false;
      if (!q) return true;
      return [row.source, row.target, row.reason, row.relationship_type]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [data, query, typeFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <LoadingSpinner text="Loading relationships..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader
        title="Relationships"
        subtitle="Correlated links returned by the backend. Types such as TRANSACTION, CALL, SHARED_IMEI, SHARED_IP appear only if they exist in the vault."
      />

      {!data || data.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="No relationships recorded"
          description="Run analysis to correlate shared devices, calls and transfers."
        />
      ) : (
        <div className="bg-white border border-police-border">
          <div className="px-3 py-2 border-b border-police-border flex flex-wrap gap-2">
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search source, target, reason..."
              className="border border-police-border px-2 py-1 text-xs flex-1 min-w-[180px]"
            />
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="border border-police-border px-2 py-1 text-xs">
              {types.map((t) => <option key={t} value={t}>{t === 'ALL' ? 'All relationship types' : t}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-police-subtle uppercase text-police-textMuted">
                <tr>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Target</th>
                  <th className="px-3 py-2">Confidence</th>
                  <th className="px-3 py-2">Reason</th>
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-3 py-2">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((row) => (
                  <tr key={row.id} className="border-t border-police-border">
                    <td className="px-3 py-2 font-mono">
                      {row.source}
                      <span className="block text-[10px] text-police-textDim">{row.source_type}</span>
                    </td>
                    <td className="px-3 py-2 font-semibold">{row.relationship_type}</td>
                    <td className="px-3 py-2 font-mono">
                      {row.target}
                      <span className="block text-[10px] text-police-textDim">{row.target_type}</span>
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {row.confidence != null ? `${Math.round(Number(row.confidence) * 100)}%` : '—'}
                    </td>
                    <td className="px-3 py-2 max-w-xs truncate" title={row.reason}>{row.reason || '—'}</td>
                    <td className="px-3 py-2 font-mono whitespace-nowrap">{row.timestamp ? formatDate(row.timestamp) : '—'}</td>
                    <td className="px-3 py-2">{row.evidence_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-police-border">
            <Pager page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}

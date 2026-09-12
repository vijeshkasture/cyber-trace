import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { timelineService } from '../services/timelineService.js';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import useAsyncResource from '../hooks/useAsyncResource.js';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Pager from '../components/common/Pager.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';

const PAGE_SIZE = 80;

export default function TimelinePage() {
  const { caseId } = useParams();
  const { refreshKey } = useInvestigation();
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data, loading, error, reload } = useAsyncResource(
    () => timelineService.getTimeline(caseId),
    [caseId, refreshKey]
  );

  const types = useMemo(() => {
    const set = new Set((data || []).map((e) => e.event_type).filter(Boolean));
    return ['ALL', ...Array.from(set).sort()];
  }, [data]);

  const events = useMemo(() => {
    const list = (data || []).filter((e) => typeFilter === 'ALL' || e.event_type === typeFilter);
    return [...list].sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  }, [data, typeFilter]);

  const paged = events.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <LoadingSpinner text="Loading chronological timeline..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader
        title="Event timeline"
        subtitle="Unified chronological events from the backend timeline service. Filtering is applied in the workstation; event content is not invented here."
      />

      {!data || data.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No timeline events"
          description="Run analysis so transactions, calls and correlated links can be ordered."
        />
      ) : (
        <div className="bg-white border border-police-border">
          <div className="px-3 py-2 border-b border-police-border">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="border border-police-border px-2 py-1 text-xs"
            >
              {types.map((t) => (
                <option key={t} value={t}>{t === 'ALL' ? 'All event types' : t}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-police-subtle uppercase text-police-textMuted">
                <tr>
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Target</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((ev, idx) => (
                  <tr key={`${ev.timestamp}-${ev.source_entity}-${idx}`} className="border-t border-police-border align-top">
                    <td className="px-3 py-2 font-mono whitespace-nowrap">{formatDate(ev.timestamp)}</td>
                    <td className="px-3 py-2 font-semibold">{ev.event_type}</td>
                    <td className="px-3 py-2 font-mono">{ev.source_entity}</td>
                    <td className="px-3 py-2 font-mono">{ev.target_entity}</td>
                    <td className="px-3 py-2 max-w-md">{ev.description}</td>
                    <td className="px-3 py-2 font-mono">{ev.amount != null ? formatCurrency(ev.amount) : '—'}</td>
                    <td className="px-3 py-2">{ev.evidence_ref || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-police-border">
            <Pager page={page} pageSize={PAGE_SIZE} total={events.length} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}

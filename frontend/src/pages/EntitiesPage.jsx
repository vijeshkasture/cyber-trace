import React, { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import { entityService } from '../services/entityService.js';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import useAsyncResource from '../hooks/useAsyncResource.js';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import SeverityBadge from '../components/common/SeverityBadge.jsx';
import Pager from '../components/common/Pager.jsx';
import EntityDossier from '../components/dossier/EntityDossier.jsx';

const PAGE_SIZE = 50;
const KNOWN_TYPES = ['PHONE', 'ACCOUNT', 'UPI', 'IP', 'IMEI', 'IMSI', 'MAC'];

export default function EntitiesPage() {
  const { caseId } = useParams();
  const [params] = useSearchParams();
  const { selectedEntity, setSelectedEntity, refreshKey } = useInvestigation();
  const [query, setQuery] = useState(params.get('q') || '');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data, loading, error, reload } = useAsyncResource(
    () => entityService.getEntities(caseId),
    [caseId, refreshKey]
  );

  const types = useMemo(() => {
    const present = new Set((data || []).map((e) => e.type));
    return ['ALL', ...KNOWN_TYPES.filter((t) => present.has(t)), ...Array.from(present).filter((t) => !KNOWN_TYPES.includes(t)).sort()];
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || [])
      .filter((row) => {
        if (typeFilter !== 'ALL' && row.type !== typeFilter) return false;
        if (!q) return true;
        return (
          String(row.id || '').toLowerCase().includes(q) ||
          String(row.identifier || '').toLowerCase().includes(q) ||
          String(row.type || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.score - a.score);
  }, [data, query, typeFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <LoadingSpinner text="Loading entities..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader
        title="Entities"
        subtitle="Phone, account, UPI, IP, IMEI, IMSI and MAC identifiers extracted by the backend parser."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <section className="xl:col-span-8 bg-white border border-police-border">
          <div className="px-3 py-2 border-b border-police-border flex flex-wrap gap-2">
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search phone, account, UPI, IP, IMEI..."
              className="border border-police-border px-2 py-1 text-xs flex-1 min-w-[180px]"
            />
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="border border-police-border px-2 py-1 text-xs">
              {types.map((t) => <option key={t} value={t}>{t === 'ALL' ? 'All types' : t}</option>)}
            </select>
          </div>

          {!data || data.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No entities identified"
              description="Run analysis after uploading evidence. This list stays empty until the backend extracts identifiers."
            />
          ) : filtered.length === 0 ? (
            <EmptyState title="No matching entities" description="Adjust the search or type filter." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-police-subtle uppercase text-police-textMuted">
                    <tr>
                      <th className="px-3 py-2">Entity</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Normalized / identifier</th>
                      <th className="px-3 py-2">Risk</th>
                      <th className="px-3 py-2">Severity</th>
                      <th className="px-3 py-2">Last seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedEntity(row)}
                        className={`border-t border-police-border cursor-pointer hover:bg-blue-50 ${
                          selectedEntity?.id === row.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-3 py-2 font-mono font-semibold">{row.id}</td>
                        <td className="px-3 py-2">{row.type}</td>
                        <td className="px-3 py-2 font-mono">{row.identifier || '—'}</td>
                        <td className="px-3 py-2 font-mono">{row.score}</td>
                        <td className="px-3 py-2"><SeverityBadge severity={row.severity} /></td>
                        <td className="px-3 py-2 font-mono">{row.lastActive || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-3 py-2 border-t border-police-border">
                <Pager page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
              </div>
            </>
          )}
        </section>
        <aside className="xl:col-span-4">
          <EntityDossier entity={selectedEntity} caseId={caseId} onClose={() => setSelectedEntity(null)} />
        </aside>
      </div>
    </div>
  );
}

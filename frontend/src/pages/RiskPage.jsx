import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Database, Link2, ShieldAlert, Users } from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import { caseService } from '../services/caseService.js';
import { relationshipService } from '../services/relationshipService.js';
import useAsyncResource from '../hooks/useAsyncResource.js';
import PageHeader from '../components/common/PageHeader.jsx';
import StatCard from '../components/common/StatCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import SeverityBadge from '../components/common/SeverityBadge.jsx';
import Pager from '../components/common/Pager.jsx';
import StatusBanner from '../components/common/StatusBanner.jsx';
import FindingsPanel from '../components/findings/FindingsPanel.jsx';
import EntityDossier from '../components/dossier/EntityDossier.jsx';
import { deriveInvestigationState } from '../utils/investigationState.js';

const PAGE_SIZE = 50;

export default function RiskPage() {
  const { caseId } = useParams();
  const { currentCase, caseStats, selectedEntity, setSelectedEntity, isAnalyzing, refreshKey } = useInvestigation();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const risks = useAsyncResource(
    () => caseService.getCaseRisks(caseId),
    [caseId, refreshKey]
  );
  const anomalies = useAsyncResource(
    () => relationshipService.getAnomalies(caseId),
    [caseId, refreshKey]
  );

  const analyzed = String(currentCase?.status || '').toUpperCase() === 'ANALYZED';
  const state = deriveInvestigationState({
    currentCase,
    stats: caseStats,
    isAnalyzing,
    anomaliesCount: anomalies.data?.length,
  });

  const types = useMemo(() => {
    const set = new Set((risks.data || []).map((r) => r.type).filter(Boolean));
    return ['ALL', ...Array.from(set).sort()];
  }, [risks.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (risks.data || [])
      .filter((row) => {
        if (typeFilter !== 'ALL' && row.type !== typeFilter) return false;
        if (severityFilter !== 'ALL' && String(row.severity).toUpperCase() !== severityFilter) return false;
        if (!q) return true;
        return (
          String(row.id || '').toLowerCase().includes(q) ||
          String(row.identifier || '').toLowerCase().includes(q) ||
          String(row.type || '').toLowerCase().includes(q) ||
          (row.factors || []).join(' ').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (sortDir === 'desc' ? b.score - a.score : a.score - b.score));
  }, [risks.data, query, typeFilter, severityFilter, sortDir]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const top = caseStats?.top_suspect;

  if (risks.loading) return <LoadingSpinner text="Loading investigation data..." />;
  if (risks.error) return <ErrorState message={risks.error} onRetry={risks.reload} />;

  return (
    <div>
      <PageHeader
        title="Risk overview"
        subtitle="Dashboard figures and risk scores are calculated by the FastAPI risk engine. This workstation does not recompute them."
      />
      <StatusBanner state={state} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-4">
        <StatCard title="Raw ingested records" value={caseStats?.raw_records ?? 0} icon={Database} />
        <StatCard title="Identified entities" value={caseStats?.entities_count ?? 0} icon={Users} />
        <StatCard title="Correlated links" value={caseStats?.relationships_count ?? 0} icon={Link2} />
        <StatCard
          title="High-risk suspects"
          value={caseStats?.high_risk_count ?? 0}
          icon={ShieldAlert}
          badge={`${caseStats?.critical_count ?? 0} critical`}
          badgeType="critical"
          subtitle={caseStats?.critical_count ? `${caseStats.critical_count} critical` : 'No critical findings'}
        />
        <StatCard
          title="Highest-risk entity"
          value={top ? `${top.score} / 100` : '0 / 100'}
          subtitle={top ? top.id : 'None recorded'}
        />
      </div>

      <FindingsPanel
        analyzed={analyzed}
        findings={anomalies.data || []}
        loading={anomalies.loading}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <section className="xl:col-span-8 bg-white border border-police-border">
          <div className="px-3 py-2 border-b border-police-border flex flex-wrap gap-2 items-center">
            <h2 className="font-serif font-bold text-police-navy mr-auto">Risk assessment registry</h2>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search entity, type, factor..."
              className="border border-police-border px-2 py-1 text-xs w-48"
            />
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="border border-police-border px-2 py-1 text-xs">
              {types.map((t) => <option key={t} value={t}>{t === 'ALL' ? 'All types' : t}</option>)}
            </select>
            <select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }} className="border border-police-border px-2 py-1 text-xs">
              {['ALL', 'CRITICAL', 'HIGH', 'MED', 'LOW'].map((s) => (
                <option key={s} value={s}>{s === 'ALL' ? 'All severity' : s}</option>
              ))}
            </select>
            <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} className="border border-police-border px-2 py-1 text-xs">
              <option value="desc">Risk high → low</option>
              <option value="asc">Risk low → high</option>
            </select>
          </div>

          {!risks.data || risks.data.length === 0 ? (
            <EmptyState
              title={analyzed ? 'No entities after analysis' : 'No risk registry yet'}
              description={analyzed ? 'Analysis completed with an empty entity set.' : 'Upload evidence and run analysis to populate this table.'}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-police-subtle text-police-textMuted uppercase tracking-wide">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Entity</th>
                      <th className="px-3 py-2 font-semibold">Type</th>
                      <th className="px-3 py-2 font-semibold">Risk score</th>
                      <th className="px-3 py-2 font-semibold">Severity</th>
                      <th className="px-3 py-2 font-semibold">Risk factors</th>
                      <th className="px-3 py-2 font-semibold">Connections</th>
                      <th className="px-3 py-2 font-semibold">Last activity</th>
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
                        <td className="px-3 py-2 font-mono font-semibold text-police-navy">{row.id}</td>
                        <td className="px-3 py-2">{row.type}</td>
                        <td className="px-3 py-2 font-mono">{row.score}</td>
                        <td className="px-3 py-2"><SeverityBadge severity={row.severity} /></td>
                        <td className="px-3 py-2 max-w-[220px] truncate" title={(row.factors || []).join(', ')}>
                          {(row.factors || []).join('; ') || '—'}
                        </td>
                        <td className="px-3 py-2 font-mono">{row.nodes ?? 0}</td>
                        <td className="px-3 py-2 font-mono whitespace-nowrap">{row.lastActive || '—'}</td>
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

        <aside className="xl:col-span-4 min-h-[480px]">
          <EntityDossier entity={selectedEntity} caseId={caseId} onClose={() => setSelectedEntity(null)} />
        </aside>
      </div>
    </div>
  );
}

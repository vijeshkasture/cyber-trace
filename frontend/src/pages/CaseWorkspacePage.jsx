import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileCheck2, ShieldAlert } from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import StatCard from '../components/common/StatCard.jsx';
import StatusBanner from '../components/common/StatusBanner.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { deriveInvestigationState } from '../utils/investigationState.js';
import { formatDate } from '../utils/formatters.js';

export default function CaseWorkspacePage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { currentCase, caseStats, isAnalyzing } = useInvestigation();
  const state = deriveInvestigationState({
    currentCase,
    stats: caseStats,
    isAnalyzing,
  });

  if (!currentCase) {
    return <LoadingSpinner text="Loading case file..." />;
  }

  const go = (sub) => navigate(`/cases/${encodeURIComponent(caseId)}/${sub}`);

  return (
    <div>
      <PageHeader
        title={currentCase.title}
        subtitle="Case workspace. All figures below are taken from the FastAPI vault for this file."
        actions={
          <button
            type="button"
            onClick={() => go('risk')}
            className="px-3 py-1.5 bg-police-accent text-white text-sm font-semibold hover:bg-police-accentHover"
          >
            Open risk overview
          </button>
        }
      />
      <StatusBanner state={state} />

      <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-white border border-police-border rounded-md p-3">
          <dt className="text-[11px] uppercase tracking-[0.08em] text-police-textDim">Case number</dt>
          <dd className="font-mono font-semibold text-police-navy mt-1">{currentCase.case_number}</dd>
        </div>
        <div className="bg-white border border-police-border rounded-md p-3">
          <dt className="text-[11px] uppercase tracking-[0.08em] text-police-textDim">Status</dt>
          <dd className="font-semibold text-police-navy mt-1">{currentCase.status}</dd>
        </div>
        <div className="bg-white border border-police-border rounded-md p-3">
          <dt className="text-[11px] uppercase tracking-[0.08em] text-police-textDim">Opened</dt>
          <dd className="font-mono text-sm text-police-navy mt-1">{formatDate(currentCase.created_at)}</dd>
        </div>
        <div className="bg-white border border-police-border rounded-md p-3">
          <dt className="text-[11px] uppercase tracking-[0.08em] text-police-textDim">Last updated</dt>
          <dd className="font-mono text-sm text-police-navy mt-1">{formatDate(currentCase.updated_at)}</dd>
        </div>
      </dl>

      {currentCase.description && (
        <section className="bg-white border border-police-border rounded-md p-4 mb-4">
          <h2 className="text-lg font-semibold text-police-navy mb-2">Description</h2>
          <p className="text-sm text-police-textMuted leading-relaxed">{currentCase.description}</p>
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <StatCard title="Raw ingested records" value={caseStats?.raw_records ?? 0} icon={FileCheck2} />
        <StatCard title="Identified entities" value={caseStats?.entities_count ?? 0} icon={ShieldAlert} />
        <StatCard title="Correlated links" value={caseStats?.relationships_count ?? 0} />
        <StatCard
          title="High risk suspects"
          value={caseStats?.high_risk_count ?? 0}
          badge={caseStats?.top_suspect ? caseStats.top_suspect.id : null}
          badgeType="critical"
          subtitle={caseStats?.top_suspect ? `Highest risk · ${caseStats.top_suspect.score}` : 'No top suspect yet'}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => go('evidence')} className="px-3 py-1.5 border border-police-border bg-white text-sm font-semibold">
          Evidence files
        </button>
        <button type="button" onClick={() => go('integrity')} className="px-3 py-1.5 border border-police-border bg-white text-sm font-semibold">
          Chain of custody
        </button>
        <button type="button" onClick={() => go('graph')} className="px-3 py-1.5 border border-police-border bg-white text-sm font-semibold">
          Network graph
        </button>
      </div>
    </div>
  );
}

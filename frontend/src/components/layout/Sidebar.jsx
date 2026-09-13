import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  Briefcase,
  FileCheck2,
  Users,
  Share2,
  Network,
  Lock,
  FileSpreadsheet,
  Clock,
  X
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';

export default function Sidebar({ mobile = false, onNavigate }) {
  const { currentCaseId } = useInvestigation();
  const baseCasePath = currentCaseId ? `/cases/${encodeURIComponent(currentCaseId)}` : '/cases';

  const navSections = [
    {
      title: 'INVESTIGATION',
      items: [
        {
          name: 'Risk Overview',
          path: currentCaseId ? `${baseCasePath}/risk` : '/cases',
          icon: ShieldAlert,
          disabled: !currentCaseId,
        },
        {
          name: 'Cases Registry',
          path: '/cases',
          icon: Briefcase,
          disabled: false,
        },
        {
          name: 'Evidence Files',
          path: currentCaseId ? `${baseCasePath}/evidence` : '/cases',
          icon: FileCheck2,
          disabled: !currentCaseId,
        },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        {
          name: 'Entities',
          path: currentCaseId ? `${baseCasePath}/entities` : '/cases',
          icon: Users,
          disabled: !currentCaseId,
        },
        {
          name: 'Relationships',
          path: currentCaseId ? `${baseCasePath}/relationships` : '/cases',
          icon: Share2,
          disabled: !currentCaseId,
        },
        {
          name: 'Network Graph',
          path: currentCaseId ? `${baseCasePath}/graph` : '/cases',
          icon: Network,
          disabled: !currentCaseId,
        },
        {
          name: 'Event Timeline',
          path: currentCaseId ? `${baseCasePath}/timeline` : '/cases',
          icon: Clock,
          disabled: !currentCaseId,
        },
      ],
    },
    {
      title: 'INTEGRITY',
      items: [
        {
          name: 'Chain of Custody',
          path: currentCaseId ? `${baseCasePath}/integrity` : '/cases',
          icon: Lock,
          disabled: !currentCaseId,
        },
        {
          name: 'Forensic Report',
          path: currentCaseId ? `${baseCasePath}/report` : '/cases',
          icon: FileSpreadsheet,
          disabled: !currentCaseId,
        },
      ],
    },
  ];

  return (
    <aside className={`${mobile ? 'flex h-full w-full flex-col bg-white' : 'hidden w-56 shrink-0 overflow-y-auto border-r border-police-border bg-white lg:flex lg:flex-col'} select-none`}>
      {mobile && (
        <div className="flex items-center justify-between border-b border-police-border bg-police-subtle px-4 py-3">
          <div className="text-sm font-semibold text-police-navy">Investigation menu</div>
          <button type="button" onClick={onNavigate} className="rounded p-1 text-police-textDim hover:bg-white hover:text-police-text" aria-label="Close navigation">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex-1 space-y-6 p-3">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="mb-2 px-2.5 text-[10px] font-medium tracking-[0.12em] text-police-textDim uppercase">
              {section.title}
            </div>
            <nav className="space-y-1">
              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                if (item.disabled) {
                  return (
                    <div
                      key={iIdx}
                      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-slate-400 opacity-60"
                      title="Select an investigation case first"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={iIdx}
                    to={item.path}
                    end={item.path === '/cases'}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-r-md border-l-2 px-2.5 py-2 text-[13px] font-medium transition-colors ${
                        isActive
                          ? 'border-police-navy bg-blue-50 text-police-navy'
                          : 'border-transparent text-police-textMuted hover:bg-police-subtle hover:text-police-text'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-police-border bg-police-subtle p-3 text-[11px] text-police-textDim">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="font-semibold text-police-text">Evidence vault</span>
          <span className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.08em] text-emerald-800">
            SECURE
          </span>
        </div>
        <div className="truncate font-mono text-[10px] text-police-textDim">Engine: SQLite / SHA-256</div>
      </div>
    </aside>
  );
}

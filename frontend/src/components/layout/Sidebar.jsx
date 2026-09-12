import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  ShieldAlert,
  Briefcase,
  FileCheck2,
  Users,
  Share2,
  Network,
  Lock,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';

export default function Sidebar() {
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
    <aside className="w-56 bg-white border-r border-police-border flex flex-col shrink-0 overflow-y-auto select-none">
      <div className="p-3 space-y-6 flex-1">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="px-2.5 mb-2 text-[10px] font-medium tracking-[0.12em] text-police-textDim uppercase">
              {section.title}
            </div>
            <nav className="space-y-1">
              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                if (item.disabled) {
                  return (
                    <div
                      key={iIdx}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium text-slate-400 cursor-not-allowed opacity-60"
                      title="Select an investigation case first"
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={iIdx}
                    to={item.path}
                    end={item.path === '/cases'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-r-md border-l-2 transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-police-navy border-police-navy'
                          : 'border-transparent text-police-textMuted hover:text-police-text hover:bg-police-subtle'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Case Vault Status Footer */}
      <div className="p-3 border-t border-police-border bg-police-subtle text-[11px] text-police-textDim">
        <div className="flex items-center justify-between mb-1.5 gap-2">
          <span className="font-semibold text-police-text">Evidence vault</span>
          <span className="inline-flex items-center gap-1 font-mono text-[9px] tracking-[0.08em] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
            SECURE
          </span>
        </div>
        <div className="font-mono text-[10px] text-police-textDim truncate">
          Engine: SQLite / SHA-256
        </div>
      </div>
    </aside>
  );
}

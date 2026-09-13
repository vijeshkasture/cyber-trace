import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useInvestigation } from '../../context/InvestigationContext';

export default function Shell() {
  const { caseId } = useParams();
  const location = useLocation();
  const { selectCase, currentCaseId } = useInvestigation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (caseId && caseId !== currentCaseId) {
      selectCase(caseId);
    }
  }, [caseId, currentCaseId, selectCase]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen flex flex-col bg-police-bg font-sans overflow-hidden">
      <Header onMenuToggle={() => setMobileNavOpen((prev) => !prev)} mobileNavOpen={mobileNavOpen} />

      <div className="relative flex flex-1 min-h-0">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div
          className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] border-r border-police-border bg-white shadow-2xl transition-transform duration-200 ease-out lg:hidden ${
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} />
        </div>

        {mobileNavOpen && (
          <button
            type="button"
            aria-label="Close mobile navigation"
            className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

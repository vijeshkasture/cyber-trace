import React, { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useInvestigation } from '../../context/InvestigationContext';

export default function Shell() {
  const { caseId } = useParams();
  const { selectCase, currentCaseId } = useInvestigation();

  useEffect(() => {
    if (caseId && caseId !== currentCaseId) {
      selectCase(caseId);
    }
  }, [caseId, currentCaseId, selectCase]);

  return (
    <div className="h-screen flex flex-col bg-police-bg font-sans">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-5 lg:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

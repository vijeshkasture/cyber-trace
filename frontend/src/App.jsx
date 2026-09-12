import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Shell from './components/layout/Shell.jsx';
import CasesPage from './pages/CasesPage.jsx';
import NewCasePage from './pages/NewCasePage.jsx';
import CaseWorkspacePage from './pages/CaseWorkspacePage.jsx';
import RiskPage from './pages/RiskPage.jsx';
import EvidencePage from './pages/EvidencePage.jsx';
import EntitiesPage from './pages/EntitiesPage.jsx';
import RelationshipsPage from './pages/RelationshipsPage.jsx';
import GraphPage from './pages/GraphPage.jsx';
import TimelinePage from './pages/TimelinePage.jsx';
import IntegrityPage from './pages/IntegrityPage.jsx';
import ReportPage from './pages/ReportPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Navigate to="/cases" replace />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/cases/new" element={<NewCasePage />} />
        <Route path="/cases/:caseId" element={<CaseWorkspacePage />} />
        <Route path="/cases/:caseId/risk" element={<RiskPage />} />
        <Route path="/cases/:caseId/evidence" element={<EvidencePage />} />
        <Route path="/cases/:caseId/entities" element={<EntitiesPage />} />
        <Route path="/cases/:caseId/relationships" element={<RelationshipsPage />} />
        <Route path="/cases/:caseId/graph" element={<GraphPage />} />
        <Route path="/cases/:caseId/timeline" element={<TimelinePage />} />
        <Route path="/cases/:caseId/integrity" element={<IntegrityPage />} />
        <Route path="/cases/:caseId/report" element={<ReportPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/cases" replace />} />
    </Routes>
  );
}

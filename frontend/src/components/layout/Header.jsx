import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Search,
  UploadCloud,
  Play,
  ChevronDown,
  Loader2,
  UserCheck
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import UploadModal from '../modals/UploadModal';
import AnalysisModal from '../modals/AnalysisModal';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    cases,
    currentCaseId,
    currentCase,
    caseStats,
    selectCase,
    runAnalysis,
    isAnalyzing,
    analysisResult,
    triggerRefresh
  } = useInvestigation();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCaseChange = (e) => {
    const selected = e.target.value;
    if (selected === '__NEW__') {
      navigate('/cases');
      return;
    }
    selectCase(selected);
    // Maintain current subpath if inside a case, or default to risk
    const pathParts = location.pathname.split('/');
    const subview = pathParts[3] || 'risk';
    navigate(`/cases/${selected}/${subview}`);
  };

  const handleTriggerAnalysis = async () => {
    if (!currentCaseId || isAnalyzing) return;
    setAnalysisError(null);
    setIsAnalysisModalOpen(true);
    try {
      await runAnalysis(currentCaseId);
    } catch (err) {
      setAnalysisError(err.message || 'Analysis pipeline failed');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim() || !currentCaseId) return;
    // Navigate to entities view with search query
    navigate(`/cases/${currentCaseId}/entities?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <>
      <header className="h-16 border-b border-police-navy bg-police-navy text-white z-30 flex items-center justify-between px-5 lg:px-7">
        <div className="flex items-center gap-5 min-w-0 flex-1">
          <div
            onClick={() => navigate('/cases')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="flex items-center justify-center rounded-none bg-transparent p-0 shadow-none border-0">
              <img
                src="/ctlogo1.png"
                alt="CyberTrace logo"
                className="h-14 w-auto max-w-[260px] object-contain"
              />
            </div>
          </div>

          <div className="h-4 w-px bg-white/20 hidden md:block" />

          {/* Active Case Selector & Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-slate-300 font-medium hidden md:inline">Case</span>
            <div className="relative inline-block">
              <select
                value={currentCaseId || ''}
                onChange={handleCaseChange}
                className="appearance-none pl-2.5 pr-8 py-1 bg-police-subtle border border-police-border hover:border-police-borderStrong rounded text-xs font-mono font-semibold text-police-text focus:outline-none focus:border-police-accent cursor-pointer max-w-[180px] sm:max-w-[260px] truncate"
              >
                <option value="" disabled>-- Select Case --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.case_number}>
                    {c.case_number} — {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-police-textDim absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Global Entity Search */}
        <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder={currentCaseId ? `Search entities in ${currentCaseId}...` : "Select case to search..."}
              disabled={!currentCaseId}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-police-subtle border border-police-border rounded text-xs text-police-text placeholder:text-police-textDim focus:outline-none focus:border-police-accent focus:bg-white disabled:opacity-50 font-mono"
            />
            <Search className="w-3.5 h-3.5 text-police-textDim absolute left-2.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsUploadOpen(true)}
            disabled={!currentCaseId}
            title={!currentCaseId ? "Select or create a case first" : "Upload evidence files"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-police-border hover:bg-slate-50 text-police-text text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadCloud className="w-3.5 h-3.5 text-police-accent" />
            <span className="hidden sm:inline">Upload Evidence</span>
          </button>

          <button
            onClick={handleTriggerAnalysis}
            disabled={!currentCaseId || isAnalyzing || !(caseStats?.files_count > 0)}
            title={
              !currentCaseId
                ? 'Select or create a case first'
                : !(caseStats?.files_count > 0)
                  ? 'Upload evidence before running analysis'
                  : 'Execute full forensic analysis pipeline'
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-police-accent hover:bg-police-accentHover text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Analysis</span>
              </>
            )}
          </button>

          <div className="h-4 w-px bg-white/20 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 pl-1 text-xs">
            <div className="w-6 h-6 border border-white/30 flex items-center justify-center text-slate-200">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-[11px] font-bold text-white leading-none">Duty officer</div>
              <div className="text-[10px] text-slate-300 leading-none mt-0.5">Cyber Crime Cell</div>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        caseId={currentCaseId}
        onUploadSuccess={() => {
          triggerRefresh();
        }}
      />

      <AnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        isAnalyzing={isAnalyzing}
        result={analysisResult}
        error={analysisError}
        caseId={currentCaseId}
      />
    </>
  );
}

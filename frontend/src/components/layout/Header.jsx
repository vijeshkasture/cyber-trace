import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  UploadCloud,
  Play,
  ChevronDown,
  Loader2,
  UserCheck,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { useAuth } from '../../context/AuthContext';
import UploadModal from '../modals/UploadModal';
import AnalysisModal from '../modals/AnalysisModal';

export default function Header({ onMenuToggle, mobileNavOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    cases,
    currentCaseId,
    caseStats,
    selectCase,
    runAnalysis,
    isAnalyzing,
    analysisResult,
    triggerRefresh
  } = useInvestigation();
  const { user, logout } = useAuth();

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
    navigate(`/cases/${currentCaseId}/entities?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const logoutAndClose = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="border-b border-police-navy bg-police-navy text-white z-30">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-5 lg:px-7">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={onMenuToggle}
              className="inline-flex h-10 w-10 items-center justify-center rounded border border-white/15 bg-white/5 text-white lg:hidden"
              aria-label="Open navigation menu"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <div
              onClick={() => navigate('/cases')}
              className="flex min-w-0 cursor-pointer items-center gap-2.5 shrink-0"
            >
              <img
                src="/ctlogo1.png"
                alt="CyberTrace logo"
                className="h-9 w-auto max-w-[180px] object-contain sm:h-11 lg:h-14 lg:max-w-[260px]"
              />
            </div>

            <div className="hidden h-4 w-px bg-white/20 md:block" />

            <div className="hidden min-w-0 flex-1 items-center gap-2 md:flex">
              <span className="hidden text-xs font-medium text-slate-300 xl:inline">Case</span>
              <div className="relative w-full max-w-[220px] lg:max-w-[260px]">
                <select
                  value={currentCaseId || ''}
                  onChange={handleCaseChange}
                  className="w-full appearance-none truncate rounded border border-police-border bg-police-subtle py-1.5 pl-2.5 pr-8 text-xs font-mono font-semibold text-police-text focus:border-police-accent focus:outline-none"
                >
                  <option value="" disabled>-- Select Case --</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.case_number}>
                      {c.case_number} — {c.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-police-textDim" />
              </div>
            </div>
          </div>

          <div className="hidden flex-1 items-center justify-end lg:flex">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder={currentCaseId ? `Search entities in ${currentCaseId}...` : 'Select case to search...'}
                disabled={!currentCaseId}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded border border-police-border bg-police-subtle py-1.5 pl-8 pr-3 text-xs text-police-text placeholder:text-police-textDim focus:border-police-accent focus:bg-white focus:outline-none disabled:opacity-50"
              />
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-police-textDim" />
            </form>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsUploadOpen(true)}
              disabled={!currentCaseId}
              title={!currentCaseId ? 'Select or create a case first' : 'Upload evidence files'}
              className="inline-flex items-center gap-1.5 rounded border border-police-border bg-white px-2.5 py-2 text-[11px] font-semibold text-police-text transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
            >
              <UploadCloud className="h-3.5 w-3.5 text-police-accent" />
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
              className="inline-flex items-center gap-1.5 rounded bg-police-accent px-2.5 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-police-accentHover disabled:cursor-not-allowed disabled:opacity-50 sm:px-3.5"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="hidden sm:inline">Processing...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Run Analysis</span>
                </>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-1 text-xs">
              <div className="flex h-7 w-7 items-center justify-center border border-white/30 bg-white/5 text-slate-200">
                <UserCheck className="h-3.5 w-3.5" />
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-[11px] font-bold text-white leading-none">{user?.full_name || 'Officer'}</div>
                <div className="mt-0.5 text-[10px] leading-none text-slate-300">{user?.department || 'Investigation Unit'}</div>
              </div>
              <button
                type="button"
                onClick={logoutAndClose}
                className="ml-1 inline-flex items-center gap-1 rounded border border-white/20 bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-200 transition hover:bg-white/10"
                title="Log out"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-3 pb-3 pt-2 md:hidden">
          <div className="space-y-2">
            <div className="relative">
              <select
                value={currentCaseId || ''}
                onChange={handleCaseChange}
                className="w-full appearance-none rounded border border-police-border bg-police-subtle py-2 pl-3 pr-8 text-xs font-mono font-semibold text-police-text focus:border-police-accent focus:outline-none"
              >
                <option value="" disabled>-- Select Case --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.case_number}>
                    {c.case_number} — {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-police-textDim" />
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder={currentCaseId ? 'Search entities...' : 'Select case to search...'}
                disabled={!currentCaseId}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded border border-police-border bg-police-subtle py-2 pl-9 pr-3 text-xs text-police-text placeholder:text-police-textDim focus:border-police-accent focus:outline-none disabled:opacity-50"
              />
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-police-textDim" />
            </form>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                disabled={!currentCaseId}
                className="flex-1 rounded border border-police-border bg-white px-3 py-2 text-[11px] font-semibold text-police-text transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Upload
              </button>
              <button
                type="button"
                onClick={handleTriggerAnalysis}
                disabled={!currentCaseId || isAnalyzing || !(caseStats?.files_count > 0)}
                className="flex-1 rounded bg-police-accent px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-police-accentHover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAnalyzing ? 'Processing...' : 'Analyze'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 rounded border border-white/10 bg-white/5 px-2 py-2 text-[11px] text-slate-200">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center border border-white/20 bg-white/5">
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white">{user?.full_name || 'Officer'}</div>
                  <div className="truncate text-[10px] text-slate-300">{user?.department || 'Investigation Unit'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={logoutAndClose}
                className="inline-flex items-center gap-1 rounded border border-white/20 bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-200"
              >
                <LogOut className="h-3 w-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

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

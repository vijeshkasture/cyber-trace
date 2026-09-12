import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  ChevronRight,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';
import { caseService } from '../services/caseService';
import CreateCaseModal from '../components/modals/CreateCaseModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

export default function CasesPage() {
  const navigate = useNavigate();
  const { cases, loadCases, loadingCases, caseError, selectCase } = useInvestigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const filteredCases = cases.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.case_number.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  const handleSelectCase = (caseNumber) => {
    selectCase(caseNumber);
    navigate(`/cases/${encodeURIComponent(caseNumber)}/risk`);
  };

  const handleDeleteCase = async (e, caseNumber) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete case ${caseNumber} and all its evidence and forensic findings? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(caseNumber);
      await caseService.deleteCase(caseNumber);
      await loadCases();
    } catch (err) {
      alert(`Failed to delete case: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-police-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-police-text flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-police-accent" />
            Cases registry
          </h1>
          <p className="text-sm text-police-textDim mt-1">
            Active and archived cybercrime case files stored within the local SQLite evidentiary vault.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-police-accent hover:bg-police-accentHover text-white text-xs font-semibold rounded transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New case file
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 border border-police-border rounded-md">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by case number, title, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-police-subtle border border-police-border rounded text-xs text-police-text placeholder:text-police-textDim focus:outline-none focus:border-police-accent focus:bg-white"
          />
          <Search className="w-4 h-4 text-police-textDim absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="text-xs text-police-textDim font-medium">
          Total cases: <span className="font-semibold text-police-text">{filteredCases.length}</span>
        </div>
      </div>

      {/* Content Area */}
      {loadingCases ? (
        <LoadingSpinner text="Retrieving case dossiers from SQLite vault..." />
      ) : caseError ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error Accessing SQLite Vault</p>
            <p className="mt-0.5">{caseError}</p>
          </div>
        </div>
      ) : filteredCases.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={searchTerm ? "No Matching Cases Found" : "No Investigation Cases Registered"}
          description={
            searchTerm
              ? `No case matching "${searchTerm}" was located in the database.`
              : "The SQLite vault currently has zero registered cases. Initiate a new case file to commence evidentiary ingestion."
          }
          actionLabel="Initiate Case"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              onClick={() => handleSelectCase(c.case_number)}
              className="bg-white border border-police-border hover:border-police-accent rounded-lg p-4 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-police-accent border border-blue-200">
                    {c.case_number}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {c.status || 'ACTIVE'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-police-text group-hover:text-police-accent transition-colors line-clamp-1 mb-1">
                  {c.title}
                </h3>

                <p className="text-xs text-police-textDim line-clamp-2 mb-4 leading-relaxed">
                  {c.description || 'No detailed case summary specified.'}
                </p>
              </div>

              <div className="pt-3 border-t border-police-border flex items-center justify-between text-xs text-police-textDim">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(c.created_at)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDeleteCase(e, c.case_number)}
                    disabled={deletingId === c.case_number}
                    title="Delete Case"
                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-1 text-police-accent font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                    <span>Open</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateCaseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCaseCreated={(newCase) => {
          loadCases();
          handleSelectCase(newCase.case_number);
        }}
      />
    </div>
  );
}

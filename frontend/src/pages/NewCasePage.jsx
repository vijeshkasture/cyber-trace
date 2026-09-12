import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateCaseModal from '../components/modals/CreateCaseModal.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import { useInvestigation } from '../context/InvestigationContext.jsx';

export default function NewCasePage() {
  const navigate = useNavigate();
  const { loadCases, selectCase } = useInvestigation();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Open a new case file"
        subtitle="Register a unique case number before ingesting evidence. The record is stored in the local SQLite vault."
      />
      <CreateCaseModal
        isOpen
        onClose={() => navigate('/cases')}
        onCaseCreated={(created) => {
          loadCases();
          selectCase(created.case_number);
          navigate(`/cases/${encodeURIComponent(created.case_number)}`);
        }}
      />
    </div>
  );
}

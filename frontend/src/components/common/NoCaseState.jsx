import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import EmptyState from './EmptyState.jsx';

export default function NoCaseState({ missingCaseId }) {
  const navigate = useNavigate();

  if (missingCaseId) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Case not in the registry"
        description={`There is no investigation file matching “${missingCaseId}”. Open the case list or register a new case.`}
        actionLabel="View cases"
        onAction={() => navigate('/cases')}
      />
    );
  }

  return (
    <EmptyState
      icon={Briefcase}
      title="No cases registered"
      description="The investigation vault is empty. Create a case file, then upload evidence to begin analysis."
      actionLabel="Create case"
      onAction={() => navigate('/cases/new')}
    />
  );
}

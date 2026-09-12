import React from 'react';
import { useParams } from 'react-router-dom';
import { useInvestigation } from '../../context/InvestigationContext.jsx';
import { isNotFoundError } from '../../utils/errors.js';
import LoadingSpinner from './LoadingSpinner.jsx';
import ErrorState from './ErrorState.jsx';
import NoCaseState from './NoCaseState.jsx';

export default function VaultGate({ loading, error, onRetry, loadingText, children }) {
  const { caseId } = useParams();
  const { cases, casesReady, caseError } = useInvestigation();
  const list = Array.isArray(cases) ? cases : [];

  if (!casesReady) {
    return <LoadingSpinner text={loadingText || 'Loading investigation data...'} />;
  }

  if (!caseError && list.length === 0) {
    return <NoCaseState />;
  }

  const known = !caseId || list.some(
    (c) => c.case_number === caseId || String(c.id) === String(caseId)
  );
  if (caseId && !known) {
    return <NoCaseState missingCaseId={caseId} />;
  }

  if (loading) {
    return <LoadingSpinner text={loadingText || 'Loading investigation data...'} />;
  }

  if (error) {
    if (isNotFoundError(error)) {
      return <NoCaseState missingCaseId={caseId} />;
    }
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  return children;
}

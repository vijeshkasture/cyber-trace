export function deriveInvestigationState({
  currentCase,
  stats,
  isAnalyzing,
  anomaliesCount,
}) {
  if (!currentCase) return 'NO_CASE_SELECTED';
  if (isAnalyzing) return 'PROCESSING';

  const files = stats?.files_count ?? 0;
  const entities = stats?.entities_count ?? 0;
  const analyzed = String(currentCase.status || '').toUpperCase() === 'ANALYZED';

  if (files === 0) return 'CASE_HAS_NO_EVIDENCE';
  if (!analyzed && entities === 0) return 'READY_FOR_ANALYSIS';
  if (!analyzed) return 'EVIDENCE_UPLOADED';
  if (anomaliesCount === 0) return 'ANALYSIS_COMPLETE_NO_FINDINGS';
  if (anomaliesCount > 0) return 'ANALYSIS_COMPLETE_FINDINGS';
  return 'ANALYSIS_COMPLETE';
}

export const STATE_COPY = {
  NO_CASE_SELECTED: {
    label: 'No case selected',
    detail: 'Open an investigation from the case registry to begin.',
  },
  CASE_HAS_NO_EVIDENCE: {
    label: 'Case created — no evidence',
    detail: 'Upload CDR, ledger, IPDR or device logs before analysis can run.',
  },
  EVIDENCE_UPLOADED: {
    label: 'Evidence on file',
    detail: 'Files are registered. Run analysis to extract entities and risk.',
  },
  READY_FOR_ANALYSIS: {
    label: 'Ready for analysis',
    detail: 'Evidence is uploaded. Execute the forensic pipeline.',
  },
  PROCESSING: {
    label: 'Processing',
    detail: 'The backend is parsing evidence and correlating entities.',
  },
  ANALYSIS_COMPLETE: {
    label: 'Analysis complete',
    detail: 'Entity, relationship and risk data are available.',
  },
  ANALYSIS_COMPLETE_NO_FINDINGS: {
    label: 'Analyzed — no findings',
    detail: 'The pipeline completed. No suspicious graph patterns were recorded.',
  },
  ANALYSIS_COMPLETE_FINDINGS: {
    label: 'Analyzed — findings detected',
    detail: 'Suspicious patterns were recorded by the correlation engine.',
  },
};

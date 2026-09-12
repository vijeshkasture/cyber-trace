import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { caseService } from '../services/caseService';
import { analysisService } from '../services/analysisService';

const InvestigationContext = createContext(null);

export function InvestigationProvider({ children }) {
  const [cases, setCases] = useState([]);
  const [currentCaseId, setCurrentCaseId] = useState('');
  const [currentCase, setCurrentCase] = useState(null);
  const [caseStats, setCaseStats] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadingCases, setLoadingCases] = useState(true);
  const [caseError, setCaseError] = useState(null);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const loadCases = useCallback(async () => {
    try {
      setLoadingCases(true);
      setCaseError(null);
      const data = await caseService.getCases();
      setCases(data);
      return data;
    } catch (err) {
      setCaseError(err.message);
      return [];
    } finally {
      setLoadingCases(false);
    }
  }, []);

  // Initial load of cases
  useEffect(() => {
    loadCases();
  }, [loadCases]);

  // Load active case details and stats when currentCaseId or refreshKey changes
  useEffect(() => {
    if (!currentCaseId) {
      setCurrentCase(null);
      setCaseStats(null);
      return;
    }

    let isMounted = true;

    async function fetchCaseData() {
      try {
        const [caseData, stats] = await Promise.all([
          caseService.getCase(currentCaseId),
          caseService.getCaseStats(currentCaseId).catch(() => null)
        ]);
        if (isMounted) {
          setCurrentCase(caseData);
          setCaseStats(stats);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching case data:', err);
        }
      }
    }

    fetchCaseData();

    return () => {
      isMounted = false;
    };
  }, [currentCaseId, refreshKey]);

  const selectCase = useCallback((caseId) => {
    setCurrentCaseId(caseId);
    setSelectedEntity(null);
  }, []);

  const runAnalysis = useCallback(async (caseIdToRun) => {
    const targetId = caseIdToRun || currentCaseId;
    if (!targetId) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analysisService.processCase(targetId);
      setAnalysisResult(result);
      triggerRefresh();
      return result;
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentCaseId, triggerRefresh]);

  const value = {
    cases,
    currentCaseId,
    currentCase,
    caseStats,
    selectedEntity,
    setSelectedEntity,
    isAnalyzing,
    analysisResult,
    setAnalysisResult,
    refreshKey,
    triggerRefresh,
    loadingCases,
    caseError,
    loadCases,
    selectCase,
    runAnalysis,
  };

  return (
    <InvestigationContext.Provider value={value}>
      {children}
    </InvestigationContext.Provider>
  );
}

export function useInvestigation() {
  const context = useContext(InvestigationContext);
  if (!context) {
    throw new Error('useInvestigation must be used within an InvestigationProvider');
  }
  return context;
}

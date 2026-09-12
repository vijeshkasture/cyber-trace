import api from './api';

export const integrityService = {
  async verifyCaseIntegrity(caseId) {
    const res = await api.get(`/cases/${encodeURIComponent(caseId)}/integrity`);
    return res.data;
  },

  async verifySingleEvidence(caseId, evidenceId) {
    const res = await api.post(`/cases/${encodeURIComponent(caseId)}/evidence/${evidenceId}/verify`);
    return res.data;
  }
};

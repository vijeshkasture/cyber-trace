import api from './api';

export const relationshipService = {
  async getRelationships(caseId) {
    const res = await api.get(`/cases/${encodeURIComponent(caseId)}/relationships`);
    return res.data;
  },

  async getAnomalies(caseId) {
    const res = await api.get(`/cases/${encodeURIComponent(caseId)}/anomalies`);
    return res.data;
  }
};

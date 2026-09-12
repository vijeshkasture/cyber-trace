import api from './api';

export const caseService = {
  async getCases() {
    const res = await api.get('/cases');
    return Array.isArray(res.data) ? res.data : [];
  },

  async getCase(caseId) {
    const res = await api.get(`/cases/${encodeURIComponent(caseId)}`);
    return res.data;
  },

  async createCase(caseData) {
    const res = await api.post('/cases', caseData);
    return res.data;
  },

  async updateCase(caseId, updateData) {
    const res = await api.put(`/cases/${encodeURIComponent(caseId)}`, updateData);
    return res.data;
  },

  async deleteCase(caseId) {
    const res = await api.delete(`/cases/${encodeURIComponent(caseId)}`);
    return res.data;
  },

  async getCaseStats(caseId) {
    const res = await api.get(`/cases/${encodeURIComponent(caseId)}/stats`);
    return res.data;
  },

  async getCaseRisks(caseId) {
    const res = await api.get(`/cases/${encodeURIComponent(caseId)}/risks`);
    return res.data;
  }
};

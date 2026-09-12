import api from './api';

export const analysisService = {
  async processCase(caseId) {
    const res = await api.post(`/cases/${encodeURIComponent(caseId)}/process`);
    return res.data;
  }
};

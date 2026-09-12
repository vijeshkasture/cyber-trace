import api from './api';

export const graphService = {
  async getGraph(caseId) {
    const res = await api.get(`/cases/${encodeURIComponent(caseId)}/graph`);
    return res.data;
  }
};

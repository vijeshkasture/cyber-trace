import api from './api';

export const reportService = {
  async generateReport(caseId) {
    const res = await api.post(`/cases/${encodeURIComponent(caseId)}/report`);
    return res.data;
  },

  async downloadReport(caseId) {
    const res = await api.get(`/cases/${encodeURIComponent(caseId)}/report`, {
      responseType: 'blob'
    });
    return res.data;
  }
};

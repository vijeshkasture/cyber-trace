import api from './api';

export const evidenceService = {
  async getEvidence(caseId) {
    const res = await api.get(`/cases/${encodeURIComponent(caseId)}/evidence`);
    return res.data;
  },

  async uploadEvidence(caseId, file, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post(`/cases/${encodeURIComponent(caseId)}/evidence`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return res.data;
  }
};

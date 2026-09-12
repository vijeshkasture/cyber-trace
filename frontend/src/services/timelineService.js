import api from './api';

export const timelineService = {
  async getTimeline(caseId) {
    const res = await api.get(`/cases/${encodeURIComponent(caseId)}/timeline`);
    return res.data;
  }
};

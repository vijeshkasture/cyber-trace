import api from './api';

export const entityService = {
  async getEntities(caseId) {
    const res = await api.get(`/cases/${encodeURIComponent(caseId)}/entities`);
    return res.data;
  },

  async getEntityDossier(caseId, entityId) {
    const res = await api.get(`/cases/${encodeURIComponent(caseId)}/entities/${encodeURIComponent(entityId)}`);
    return res.data;
  }
};

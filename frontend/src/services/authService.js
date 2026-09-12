import api from './api';

export const authService = {
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async getMe(token) {
    const response = await api.get('/auth/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  }
};

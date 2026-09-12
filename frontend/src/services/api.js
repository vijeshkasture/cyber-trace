import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 300000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg || item).join('; ')
      : detail || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(typeof message === 'string' ? message : 'An unexpected error occurred'));
  }
);

export default api;

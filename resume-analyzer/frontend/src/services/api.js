import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ─── Axios Instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60s for AI calls
});

// ─── Request Interceptor: Attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth APIs ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Resume APIs ───────────────────────────────────────────────────────────────
export const resumeAPI = {
  upload: (formData) =>
    api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyze: (resumeId) => api.post('/analyze', { resume_id: resumeId }),
  getResult: (analysisId) => api.get(`/results/${analysisId}`),
  getHistory: () => api.get('/history'),
};

export default api;

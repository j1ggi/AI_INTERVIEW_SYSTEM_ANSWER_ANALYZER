import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s timeout
});

// Request Interceptor: Attach JWT Token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mockvue_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Errors (401 Expired Sessions, etc.)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Return server error message cleanly without wiping candidate session
      return Promise.reject(error.response.data || { message: 'An unexpected error occurred.' });
    } else if (error.request) {
      return Promise.reject({
        message: 'Cannot connect to MockVue server. Please verify your internet or backend connection.',
      });
    } else {
      return Promise.reject({ message: error.message });
    }
  }
);

export default api;

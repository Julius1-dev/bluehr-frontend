import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // This routes through Vite's proxy
});

// ✅ Automatically add Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or use sessionStorage if you store it there
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;

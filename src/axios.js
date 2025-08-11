// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token y empresa automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const empresaId = localStorage.getItem('empresa_id');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (empresaId) {
    config.headers['X-Empresa-Id'] = empresaId; // Header limpio
  }

  return config;
}, (error) => Promise.reject(error));

export default api;

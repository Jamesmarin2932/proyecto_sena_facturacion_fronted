// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // apunta a tu backend
  withCredentials: true, // importante para cookies / sesión
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Interceptor para enviar token y empresa_id automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const empresaId = localStorage.getItem('empresa_id');

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (empresaId) config.headers['empresa_id'] = empresaId;

  console.log('🔄 Petición a:', config.url);
  console.log('Token:', token ? '✅ Presente' : '❌ Faltante');
  console.log('Empresa ID:', empresaId ? '✅ Presente' : '❌ Faltante');

  return config;
});

// Manejo global de errores
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      console.error('❌ Network Error', error);
      alert('No se pudo conectar con el backend. Revisa tu API URL y CORS.');
    }

    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;

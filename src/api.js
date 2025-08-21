// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir token y empresa_id automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const empresaId = localStorage.getItem('empresa_id'); // ✅ Cambiado a 'empresa_id'
  
  // Debugging: verificar lo que se está enviando
  console.log('🔄 Enviando request a:', config.url);
  console.log('Token:', token ? '✅ Presente' : '❌ Faltante');
  console.log('Empresa ID:', empresaId || '❌ No especificada');
  
  // Agregar token de autorización
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Agregar header de empresa (EXACTO como lo espera el middleware)
  if (empresaId) {
    config.headers['empresa_id'] = empresaId;
    console.log('Header empresa_id enviado:', empresaId);
  }
  
  return config;
});

// Interceptor para manejar errores globales
api.interceptors.response.use(
  response => response,
  error => {
    // Redirigir a login si no está autenticado
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
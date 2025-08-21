import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true // ✅ ESTO ES ESENCIAL PARA SANCTUM
});

// Interceptor para agregar token y empresa automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const empresaId = localStorage.getItem('empresa_id');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (empresaId) {
    config.headers['X-Empresa-Id'] = empresaId;
  }

  return config;
}, (error) => Promise.reject(error));

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir al login si no está autenticado
      localStorage.removeItem('token');
      localStorage.removeItem('empresa_id');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
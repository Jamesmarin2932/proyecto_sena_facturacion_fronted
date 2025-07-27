// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Usa tu .env.production
  withCredentials: true // ✅ Necesario para Laravel Sanctum
});

export default api;

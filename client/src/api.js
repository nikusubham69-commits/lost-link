import axios from 'axios';

// Centralized API client for the frontend.
// Uses Vite env var when available, falls back to localhost for dev.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

export default api;

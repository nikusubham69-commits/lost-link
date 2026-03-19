import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Now using the online Render server
const API_BASE_URL = 'https://lost-link-server.onrender.com/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

import axios from 'axios';
import { Platform } from 'react-native';
import { getToken, callLogout } from './tokenHolder';

// ============================================================
// API Base URL Configuration
// ============================================================
// Web (browser):    hits localhost directly
// Android emulator: uses 10.0.2.2 (emulator -> host bridge)
// Physical device:  uses ngrok tunnel
// ============================================================
const NGROK_URL = 'https://communal-rabbit-profound.ngrok-free.app';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return `${NGROK_URL}/api`;
  }
  // For physical devices, use ngrok. For emulator, use 10.0.2.2.
  // Toggle this based on your testing setup:
  return `${NGROK_URL}/api`;
  // return 'http://10.0.2.2:5000/api'; // uncomment for emulator
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      callLogout();
    }
    return Promise.reject(error);
  }
);

export default api;

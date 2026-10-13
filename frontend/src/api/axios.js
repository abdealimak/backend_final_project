/**
 * Axios Configuration
 * 
 * Central Axios instance with:
 * - Base URL pointing to backend API
 * - Automatic JWT token attachment via interceptor
 * 
 * All API calls in the app should use this instance
 * instead of importing axios directly.
 */
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

/**
 * Request Interceptor
 * Automatically adds the JWT token to every request if available.
 * The token is stored in localStorage after login.
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * If we get a 401, the token is expired/invalid — clear it and redirect to login.
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;

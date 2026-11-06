import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Enhanced request interceptor with detailed logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log('🔐 API Request Interceptor:');
    console.log('📝 URL:', config.url);
    console.log('🔑 Token exists:', !!token);
    console.log('🔑 Token value:', token ? `${token.substring(0, 20)}...` : 'None');
    console.log('📋 Method:', config.method?.toUpperCase());
    console.log('📦 Data:', config.data);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to Authorization header');
      console.log('📨 Full headers:', config.headers);
    } else {
      console.log('❌ No token found in localStorage');
      console.log('📨 Headers without auth:', config.headers);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with logging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:');
    console.log('📝 URL:', response.config.url);
    console.log('📊 Status:', response.status);
    console.log('📦 Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:');
    console.log('📝 URL:', error.config?.url);
    console.log('📊 Status:', error.response?.status);
    console.log('📦 Error data:', error.response?.data);
    console.log('🔑 Had token:', !!error.config?.headers?.Authorization);
    
    if (error.response?.status === 401) {
      console.log('🔄 401 Unauthorized detected, clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
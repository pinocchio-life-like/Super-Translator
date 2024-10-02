// utils/axios.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000', // Your backend API base URL
  withCredentials: true, // Ensure cookies (including refreshToken) are sent with requests
});

// Request interceptor: Attach access token to the headers
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 403 errors and store refreshed token if present
axiosInstance.interceptors.response.use(
  (response) => {
    const newAccessToken = response.headers['authorization']?.split(' ')[1];
    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
    }
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 403) {
      console.error('Session expired. Please log in again.');
      // Optionally trigger logout
    }
    return Promise.reject(error); // For other errors, just reject the promise
  }
);

export default axiosInstance;

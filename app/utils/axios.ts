// app/utils/axios.ts
import axios from "axios";
import { logout } from "./authUtils";

const axiosInstance = axios.create({
  // baseURL: "http://localhost:5000", // API base URL
  baseURL: "https://super-translator.onrender.com", // API base URL

  // baseURL: "http://localhost:5000", // API base URL
  withCredentials: true, // Ensure cookies (including refreshToken) are sent with requests
});

// Function to request a new access token using the refresh token
const refreshAccessToken = async () => {
  console.log("Refreshing Access Token...");

  try {
    const response = await axiosInstance.post("/api/refresh/accessToken", {});
    const newAccessToken = response.data.accessToken;
    localStorage.setItem("accessToken", newAccessToken);

    // Set the Authorization header for future requests
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${newAccessToken}`;

    return newAccessToken;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    throw error;
  }
};

// Request interceptor: Attach access token to the headers
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 403 errors and store refreshed token if present
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 403 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();

        // Set the Authorization header for future requests
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Session expired. Please log in again.", refreshError);
        // Trigger logout
        logout();
        return Promise.reject(refreshError);
      }
    }
    console.error("Response Interceptor Error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;

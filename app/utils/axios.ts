import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://super-translator.onrender.com", // API base URL
  withCredentials: true, // Ensure cookies (including refreshToken) are sent with requests
});

// Function to request a new access token using the refresh token
const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://super-translator.onrender.com/api/refresh/accessToken",
      {},
      { withCredentials: true }
    );
    const newAccessToken = response.data.accessToken;
    localStorage.setItem("accessToken", newAccessToken);
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
    console.error("Request Interceptor Error:", error); // Debugging: Log request interceptor error
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 403 errors and store refreshed token if present
axiosInstance.interceptors.response.use(
  (response) => {
    const newAccessToken = response.headers["authorization"]?.split(" ")[1];
    if (newAccessToken) {
      localStorage.setItem("accessToken", newAccessToken);
    }
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
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Session expired. Please log in again.");
        // Optionally trigger logout
      }
    }
    console.error("Response Interceptor Error:", error); // Debugging: Log response interceptor error
    return Promise.reject(error); // For other errors, just reject the promise
  }
);

export default axiosInstance;

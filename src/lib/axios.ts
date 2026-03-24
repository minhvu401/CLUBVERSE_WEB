import axios from "axios";

export const AUTH_BASE_URL = "https://clubverse.onrender.com";

const axiosInstance = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

// Request interceptor to add the access token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., redirect to login or refresh token)
      console.error("Unauthorized! Redirecting...");
      if (typeof window !== "undefined") {
         // Optionally: localStorage.clear(); window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

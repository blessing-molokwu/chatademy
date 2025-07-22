import axios from "axios";

// Create axios instance with base configuration
const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Authentication service
const authService = {
  // Register new user
  async register(userData) {
    try {
      const response = await api.post("/auth/register", userData);

      if (response.data.success) {
        // DO NOT automatically store token and user data
        // Let the user decide when to log in

        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
          message: response.data.message,
        };
      }

      return { success: false, message: "Registration failed" };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await api.post("/auth/login", credentials);

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
          message: response.data.message,
        };
      }

      return { success: false, message: "Login failed" };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // Get current user profile
  async getProfile() {
    try {
      const response = await api.get("/auth/me");

      if (response.data.success) {
        // Update stored user data
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return {
          success: true,
          user: response.data.user,
        };
      }

      return { success: false, message: "Failed to get profile" };
    } catch (error) {
      console.error("Get profile error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get profile",
      };
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put("/auth/profile", profileData);

      if (response.data.success) {
        // Update stored user data
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return {
          success: true,
          user: response.data.user,
          message: response.data.message,
        };
      }

      return { success: false, message: "Profile update failed" };
    } catch (error) {
      console.error("Profile update error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Profile update failed",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put("/auth/password", passwordData);

      return {
        success: response.data.success,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Password change error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Password change failed",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // Logout user
  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  },

  // Get stored user data
  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get stored token
  getToken() {
    return localStorage.getItem("token");
  },

  // Clear authentication data
  clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default authService;

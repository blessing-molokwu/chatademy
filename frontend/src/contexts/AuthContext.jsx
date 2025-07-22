import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);

            // Optionally refresh user data from server
            const profileResult = await authService.getProfile();
            if (profileResult.success) {
              setUser(profileResult.user);
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        authService.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const result = await authService.login(credentials);

      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, message: result.message };
      }

      return {
        success: false,
        message: result.message,
        errors: result.errors,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Login failed. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const result = await authService.register(userData);

      if (result.success) {
        // DO NOT automatically authenticate the user
        // Let them see the success page and choose to log in
        return {
          success: true,
          message: result.message,
          user: result.user,
        };
      }

      return {
        success: false,
        message: result.message,
        errors: result.errors,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const result = await authService.updateProfile(profileData);

      if (result.success) {
        setUser(result.user);
        return { success: true, message: result.message };
      }

      return {
        success: false,
        message: result.message,
        errors: result.errors,
      };
    } catch (error) {
      console.error("Profile update error:", error);
      return {
        success: false,
        message: "Profile update failed. Please try again.",
      };
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      const result = await authService.changePassword(passwordData);
      return result;
    } catch (error) {
      console.error("Password change error:", error);
      return {
        success: false,
        message: "Password change failed. Please try again.",
      };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const result = await authService.getProfile();
      if (result.success) {
        setUser(result.user);
        return result.user;
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
    return null;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

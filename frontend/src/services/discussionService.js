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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const discussionService = {
  // Get discussions for a group
  getGroupDiscussions: async (groupId, params = {}) => {
    try {
      const { page = 1, limit = 10, category = "all", search = "" } = params;
      const response = await api.get(`/groups/${groupId}/discussions`, {
        params: { page, limit, category, search },
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching discussions:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch discussions",
      };
    }
  },

  // Get single discussion with replies
  getDiscussion: async (discussionId, params = {}) => {
    try {
      const { page = 1, limit = 20 } = params;
      const response = await api.get(`/discussions/${discussionId}`, {
        params: { page, limit },
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching discussion:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch discussion",
      };
    }
  },

  // Create new discussion
  createDiscussion: async (groupId, discussionData) => {
    try {
      const response = await api.post(
        `/groups/${groupId}/discussions`,
        discussionData
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error creating discussion:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create discussion",
      };
    }
  },

  // Create reply to discussion
  createReply: async (discussionId, replyData) => {
    try {
      const response = await api.post(
        `/discussions/${discussionId}/replies`,
        replyData
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error creating reply:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create reply",
      };
    }
  },

  // Update discussion
  updateDiscussion: async (discussionId, updateData) => {
    try {
      const response = await api.put(
        `/discussions/${discussionId}`,
        updateData
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error updating discussion:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update discussion",
      };
    }
  },

  // Delete discussion
  deleteDiscussion: async (discussionId) => {
    try {
      const response = await api.delete(`/discussions/${discussionId}`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error deleting discussion:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete discussion",
      };
    }
  },

  // Pin/Unpin discussion
  togglePinDiscussion: async (discussionId, isPinned) => {
    try {
      const response = await api.patch(`/discussions/${discussionId}/pin`, {
        isPinned: !isPinned,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error toggling pin status:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update pin status",
      };
    }
  },

  // Lock/Unlock discussion
  toggleLockDiscussion: async (discussionId, isLocked) => {
    try {
      const response = await api.patch(`/discussions/${discussionId}/lock`, {
        isLocked: !isLocked,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error toggling lock status:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update lock status",
      };
    }
  },

  // Helper function to format discussion categories
  getCategoryOptions: () => [
    { value: "all", label: "🌟 All Categories", color: "gray" },
    { value: "general", label: "💬 General", color: "blue" },
    { value: "research", label: "🔬 Research", color: "purple" },
    { value: "questions", label: "❓ Questions", color: "yellow" },
    { value: "announcements", label: "📢 Announcements", color: "red" },
    { value: "ideas", label: "💡 Ideas", color: "green" },
  ],

  // Helper function to get category display info
  getCategoryInfo: (category) => {
    const categories = {
      general: { label: "💬 General", color: "blue" },
      research: { label: "🔬 Research", color: "purple" },
      questions: { label: "❓ Questions", color: "yellow" },
      announcements: { label: "📢 Announcements", color: "red" },
      ideas: { label: "💡 Ideas", color: "green" },
    };
    return categories[category] || categories.general;
  },

  // Helper function to format time ago
  formatTimeAgo: (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return new Date(date).toLocaleDateString();
  },
};

export default discussionService;

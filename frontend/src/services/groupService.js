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

// Groups service
const groupService = {
  // Get all public groups with search and pagination
  async getPublicGroups(options = {}) {
    try {
      const { page = 1, limit = 10, search = "", fieldOfStudy = "" } = options;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(fieldOfStudy && { fieldOfStudy }),
      });

      const response = await api.get(`/groups?${params}`);

      return {
        success: true,
        groups: response.data.groups,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("Get public groups error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch groups",
        groups: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      };
    }
  },

  // Get user's groups
  async getMyGroups() {
    try {
      const response = await api.get("/groups/my-groups");

      return {
        success: true,
        groups: response.data.groups,
      };
    } catch (error) {
      console.error("Get my groups error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch your groups",
        groups: [],
      };
    }
  },

  // Get single group details
  async getGroup(groupId) {
    try {
      const response = await api.get(`/groups/${groupId}`);

      return {
        success: true,
        group: response.data.group,
      };
    } catch (error) {
      console.error("Get group error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch group details",
      };
    }
  },

  // Create new group
  async createGroup(groupData) {
    try {
      const response = await api.post("/groups", groupData);

      return {
        success: true,
        group: response.data.group,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Create group error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create group",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // Update group
  async updateGroup(groupId, groupData) {
    try {
      const response = await api.put(`/groups/${groupId}`, groupData);

      return {
        success: true,
        group: response.data.group,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Update group error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update group",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // Update group
  async updateGroup(groupId, groupData) {
    try {
      const response = await api.put(`/groups/${groupId}`, groupData);

      return {
        success: true,
        group: response.data.group,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Update group error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update group",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // Join group
  async joinGroup(groupId) {
    try {
      const response = await api.post(`/groups/${groupId}/join`);

      return {
        success: true,
        group: response.data.group,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Join group error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to join group",
      };
    }
  },

  // Leave group
  async leaveGroup(groupId) {
    try {
      const response = await api.post(`/groups/${groupId}/leave`);

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Leave group error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to leave group",
      };
    }
  },

  // Delete group
  async deleteGroup(groupId) {
    try {
      const response = await api.delete(`/groups/${groupId}`);

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Delete group error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete group",
      };
    }
  },

  // Remove member from group
  async removeMember(groupId, memberId) {
    try {
      const response = await api.delete(
        `/groups/${groupId}/members/${memberId}`
      );

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Remove member error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to remove member",
      };
    }
  },

  // Send group invitation
  sendInvitation: async (groupId, invitationData) => {
    try {
      const response = await api.post(
        `/groups/${groupId}/invite`,
        invitationData
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error sending invitation:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send invitation",
      };
    }
  },

  // Get group invitations (for owners)
  getGroupInvitations: async (groupId) => {
    try {
      const response = await api.get(`/groups/${groupId}/invitations`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching invitations:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch invitations",
      };
    }
  },

  // Accept invitation (public endpoint)
  acceptInvitation: async (token) => {
    try {
      const response = await api.post(`/groups/accept-invitation/${token}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error accepting invitation:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to accept invitation",
        redirectTo: error.response?.data?.redirectTo,
        email: error.response?.data?.email,
      };
    }
  },
};

export default groupService;

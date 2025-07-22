import axios from "axios";

// Create axios instance with base configuration
const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const dashboardService = {
  // Get user's dashboard statistics
  getDashboardStats: async () => {
    try {
      const [groupsResponse, papersResponse] = await Promise.all([
        api.get("/groups/my-groups"),
        // We'll need to aggregate papers from all user's groups
        api.get("/groups/my-groups"),
      ]);

      const groups = groupsResponse.data.groups || [];

      // Calculate statistics from user's groups
      let totalPapers = 0;
      let totalDiscussions = 0;
      let totalMembers = 0;

      // Get detailed stats for each group
      const groupStats = await Promise.all(
        groups.map(async (group) => {
          try {
            const [papersRes, discussionsRes] = await Promise.all([
              api.get(`/groups/${group._id}/papers?limit=1000`),
              api.get(`/groups/${group._id}/discussions?limit=1000`),
            ]);

            return {
              groupId: group._id,
              papers: papersRes.data.data?.papers?.length || 0,
              discussions: discussionsRes.data.data?.discussions?.length || 0,
              members: group.memberCount || 0,
            };
          } catch (error) {
            console.error(
              `Error fetching stats for group ${group._id}:`,
              error
            );
            return {
              groupId: group._id,
              papers: 0,
              discussions: 0,
              members: group.memberCount || 0,
            };
          }
        })
      );

      // Aggregate totals
      groupStats.forEach((stat) => {
        totalPapers += stat.papers;
        totalDiscussions += stat.discussions;
        totalMembers += stat.members;
      });

      return {
        success: true,
        data: {
          activeGroups: groups.length,
          totalPapers,
          totalDiscussions,
          totalCollaborators: totalMembers,
          groups: groupStats,
        },
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to fetch dashboard statistics",
      };
    }
  },

  // Get recent activity across user's groups
  getRecentActivity: async () => {
    try {
      const groupsResponse = await api.get("/groups/my-groups");
      const groups = groupsResponse.data.groups || [];

      const activities = [];

      // Get recent papers and discussions from all groups
      for (const group of groups.slice(0, 5)) {
        // Limit to 5 groups for performance
        try {
          const [papersRes, discussionsRes] = await Promise.all([
            api.get(`/groups/${group._id}/papers?limit=3&page=1`),
            api.get(`/groups/${group._id}/discussions?limit=3&page=1`),
          ]);

          // Add recent papers
          const papers = papersRes.data.data?.papers || [];
          papers.forEach((paper) => {
            activities.push({
              id: `paper-${paper._id}`,
              type: "paper",
              title: `New paper "${paper.title}" uploaded to ${group.name}`,
              time: paper.createdAt,
              icon: "DocumentTextIcon",
              color: "text-blue-600",
              bgColor: "bg-blue-100 dark:bg-blue-900/20",
              groupName: group.name,
              data: paper,
            });
          });

          // Add recent discussions
          const discussions = discussionsRes.data.data?.discussions || [];
          discussions.forEach((discussion) => {
            activities.push({
              id: `discussion-${discussion._id}`,
              type: "discussion",
              title: `New discussion "${discussion.title}" started in ${group.name}`,
              time: discussion.createdAt,
              icon: "ChatBubbleLeftRightIcon",
              color: "text-purple-600",
              bgColor: "bg-purple-100 dark:bg-purple-900/20",
              groupName: group.name,
              data: discussion,
            });
          });
        } catch (error) {
          console.error(
            `Error fetching activity for group ${group._id}:`,
            error
          );
        }
      }

      // Sort by time (most recent first) and limit to 10
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));

      return {
        success: true,
        data: activities.slice(0, 10),
      };
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch recent activity",
      };
    }
  },

  // Get user's recent files (papers)
  getRecentFiles: async () => {
    try {
      const groupsResponse = await api.get("/groups/my-groups");
      const groups = groupsResponse.data.groups || [];

      const files = [];

      // Get recent papers from all groups
      for (const group of groups.slice(0, 5)) {
        try {
          const papersRes = await api.get(
            `/groups/${group._id}/papers?limit=5&page=1`
          );
          const papers = papersRes.data.data?.papers || [];

          papers.forEach((paper) => {
            files.push({
              id: paper._id,
              name: paper.originalFileName,
              type: dashboardService.getFileExtension(paper.originalFileName),
              size: dashboardService.formatFileSize(paper.fileSize),
              uploadedAt: paper.createdAt,
              groupName: group.name,
              mimeType: paper.mimeType,
              downloadCount: paper.downloadCount || 0,
              viewCount: paper.viewCount || 0,
            });
          });
        } catch (error) {
          console.error(`Error fetching files for group ${group._id}:`, error);
        }
      }

      // Sort by upload time and limit to 5
      files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

      return {
        success: true,
        data: files.slice(0, 5),
      };
    } catch (error) {
      console.error("Error fetching recent files:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch recent files",
      };
    }
  },

  // Helper function to get file extension
  getFileExtension: (filename) => {
    return filename.split(".").pop()?.toLowerCase() || "unknown";
  },

  // Helper function to format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Helper function to format time ago
  formatTimeAgo: (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  },
};

export default dashboardService;

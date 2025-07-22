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

const paperService = {
  // Get papers for a group
  getPapers: async (groupId, options = {}) => {
    try {
      const {
        page = 1,
        limit = 12,
        category = "all",
        search = "",
        tags = "",
      } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        category,
        search,
        tags,
      });

      const response = await api.get(`/groups/${groupId}/papers?${params}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error fetching papers:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch papers",
      };
    }
  },

  // Upload a new paper
  uploadPaper: async (groupId, paperData, file, onProgress = null) => {
    try {
      const formData = new FormData();

      // Add file
      formData.append("file", file);

      // Add paper metadata
      formData.append("title", paperData.title);
      formData.append("description", paperData.description || "");
      formData.append("authors", JSON.stringify(paperData.authors || []));
      formData.append("tags", JSON.stringify(paperData.tags || []));
      formData.append("category", paperData.category || "research");
      formData.append("journal", paperData.journal || "");
      formData.append("doi", paperData.doi || "");
      formData.append("url", paperData.url || "");
      formData.append("isPublic", paperData.isPublic || false);

      if (paperData.publishedDate) {
        formData.append("publishedDate", paperData.publishedDate);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      // Add progress tracking if callback provided
      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        };
      }

      const response = await api.post(
        `/groups/${groupId}/papers`,
        formData,
        config
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error uploading paper:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to upload paper",
      };
    }
  },

  // Get single paper details
  getPaper: async (paperId) => {
    try {
      const response = await api.get(`/papers/${paperId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error fetching paper:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch paper",
      };
    }
  },

  // Download paper file
  downloadPaper: async (paperId, fileName) => {
    try {
      const response = await api.get(`/papers/${paperId}/download`, {
        responseType: "blob",
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: "Paper downloaded successfully",
      };
    } catch (error) {
      console.error("Error downloading paper:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to download paper",
      };
    }
  },

  // Delete paper
  deletePaper: async (paperId) => {
    try {
      const response = await api.delete(`/papers/${paperId}`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error deleting paper:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete paper",
      };
    }
  },

  // Get paper comments
  getComments: async (paperId) => {
    try {
      const response = await api.get(`/papers/${paperId}/comments`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error fetching comments:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch comments",
      };
    }
  },

  // Add comment to paper
  addComment: async (paperId, content, parentCommentId = null) => {
    try {
      const response = await api.post(`/papers/${paperId}/comments`, {
        content,
        parentCommentId,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error adding comment:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add comment",
      };
    }
  },

  // Update comment
  updateComment: async (paperId, commentId, content) => {
    try {
      const response = await api.put(
        `/papers/${paperId}/comments/${commentId}`,
        {
          content,
        }
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error updating comment:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update comment",
      };
    }
  },

  // Delete comment
  deleteComment: async (paperId, commentId) => {
    try {
      const response = await api.delete(
        `/papers/${paperId}/comments/${commentId}`
      );
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error deleting comment:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete comment",
      };
    }
  },

  // Like/unlike comment
  likeComment: async (paperId, commentId) => {
    try {
      const response = await api.post(
        `/papers/${paperId}/comments/${commentId}/like`
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error liking comment:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to like comment",
      };
    }
  },

  // Helper function to format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Helper function to get file icon based on mime type
  getFileIcon: (mimeType) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("text")) return "📃";
    return "📄"; // Default
  },

  // Helper function to get category info
  getCategoryInfo: (category) => {
    const categories = {
      research: {
        name: "Research",
        icon: "🔬",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        textColor: "text-blue-800 dark:text-blue-300",
      },
      review: {
        name: "Review",
        icon: "📖",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        textColor: "text-green-800 dark:text-green-300",
      },
      thesis: {
        name: "Thesis",
        icon: "🎓",
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
        textColor: "text-purple-800 dark:text-purple-300",
      },
      conference: {
        name: "Conference",
        icon: "🎤",
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
        textColor: "text-orange-800 dark:text-orange-300",
      },
      journal: {
        name: "Journal",
        icon: "📚",
        bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
        textColor: "text-indigo-800 dark:text-indigo-300",
      },
      preprint: {
        name: "Preprint",
        icon: "📋",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        textColor: "text-yellow-800 dark:text-yellow-300",
      },
      other: {
        name: "Other",
        icon: "📄",
        bgColor: "bg-gray-100 dark:bg-gray-700",
        textColor: "text-gray-800 dark:text-gray-300",
      },
    };

    return categories[category] || categories.other;
  },

  // Helper function to format time ago
  formatTimeAgo: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  },

  // Validate file before upload
  validateFile: (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!file) {
      return { valid: false, message: "Please select a file" };
    }

    if (file.size > maxSize) {
      return { valid: false, message: "File size must be less than 10MB" };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: "Only PDF, DOC, DOCX, and TXT files are allowed",
      };
    }

    return { valid: true };
  },
};

export default paperService;

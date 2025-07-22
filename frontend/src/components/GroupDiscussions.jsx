import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import discussionService from "../services/discussionService";
import DiscussionDetail from "./DiscussionDetail";

const GroupDiscussions = ({ groupId, group }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({});
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [showDiscussionDetail, setShowDiscussionDetail] = useState(false);

  // Create discussion form state
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
    category: "general",
    tags: [],
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Fetch discussions
  const fetchDiscussions = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await discussionService.getGroupDiscussions(groupId, {
        category: selectedCategory,
        search: searchTerm,
        page: 1,
        limit: 10,
      });

      if (result.success) {
        setDiscussions(result.data.discussions);
        setPagination(result.data.pagination);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to load discussions");
      console.error("Error fetching discussions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new discussion
  const handleCreateDiscussion = async (e) => {
    e.preventDefault();

    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      setError("Title and content are required");
      return;
    }

    setCreateLoading(true);
    setError("");

    try {
      const result = await discussionService.createDiscussion(groupId, {
        title: newDiscussion.title.trim(),
        content: newDiscussion.content.trim(),
        category: newDiscussion.category,
        tags: newDiscussion.tags,
      });

      if (result.success) {
        setNewDiscussion({
          title: "",
          content: "",
          category: "general",
          tags: [],
        });
        setShowCreateModal(false);
        fetchDiscussions(); // Refresh discussions
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to create discussion");
      console.error("Error creating discussion:", err);
    } finally {
      setCreateLoading(false);
    }
  };

  // Load discussions on component mount and when filters change
  useEffect(() => {
    fetchDiscussions();
  }, [groupId, selectedCategory, searchTerm]);

  // Handle opening discussion detail
  const handleDiscussionClick = (discussion) => {
    setSelectedDiscussion(discussion);
    setShowDiscussionDetail(true);
  };

  // Handle closing discussion detail
  const handleCloseDiscussionDetail = () => {
    setShowDiscussionDetail(false);
    setSelectedDiscussion(null);
  };

  const categoryOptions = discussionService.getCategoryOptions();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading discussions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            💬 Group Discussions
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Share ideas, ask questions, and collaborate with your team
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Discussion</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
            >
              {categoryOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search discussions..."
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400">⚠️ {error}</p>
        </div>
      )}

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No discussions yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start the conversation by creating the first discussion!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Create First Discussion
            </button>
          </div>
        ) : (
          discussions.map((discussion) => {
            const categoryInfo = discussionService.getCategoryInfo(
              discussion.category
            );
            return (
              <div
                key={discussion._id}
                onClick={() => handleDiscussionClick(discussion)}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800 dark:bg-${categoryInfo.color}-900/30 dark:text-${categoryInfo.color}-300`}
                      >
                        {categoryInfo.label}
                      </span>
                      {discussion.isPinned && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          📌 Pinned
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {discussion.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {discussion.content}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="h-4 w-4" />
                      <span>
                        {discussion.author.firstName}{" "}
                        {discussion.author.lastName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      <span>{discussion.replyCount} replies</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>
                      {discussionService.formatTimeAgo(discussion.lastActivity)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Discussion Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  💬 Create New Discussion
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewDiscussion({
                      title: "",
                      content: "",
                      category: "general",
                      tags: [],
                    });
                    setError("");
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateDiscussion} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discussion Title
                  </label>
                  <input
                    type="text"
                    value={newDiscussion.title}
                    onChange={(e) =>
                      setNewDiscussion({
                        ...newDiscussion,
                        title: e.target.value,
                      })
                    }
                    placeholder="What would you like to discuss?"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newDiscussion.category}
                    onChange={(e) =>
                      setNewDiscussion({
                        ...newDiscussion,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  >
                    {categoryOptions.slice(1).map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={newDiscussion.content}
                    onChange={(e) =>
                      setNewDiscussion({
                        ...newDiscussion,
                        content: e.target.value,
                      })
                    }
                    placeholder="Share your thoughts, questions, or ideas..."
                    rows={6}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      ⚠️ {error}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewDiscussion({
                        title: "",
                        content: "",
                        category: "general",
                        tags: [],
                      });
                      setError("");
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-xl transition-colors"
                    disabled={createLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {createLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      "Create Discussion"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Discussion Detail Modal */}
      {showDiscussionDetail && selectedDiscussion && (
        <DiscussionDetail
          discussion={selectedDiscussion}
          onClose={handleCloseDiscussionDetail}
          groupId={groupId}
        />
      )}
    </div>
  );
};

export default GroupDiscussions;

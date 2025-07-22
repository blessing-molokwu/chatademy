import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeftIcon,
  UserIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../contexts/AuthContext";
import discussionService from "../services/discussionService";
import LoadingSpinner from "./LoadingSpinner";
import ReplyItem from "./ReplyItem";

const DiscussionDetail = ({ discussion, onClose, groupId }) => {
  const { user } = useAuth();
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newReply, setNewReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [showActions, setShowActions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    category: "",
    tags: [],
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch discussion details and replies
  useEffect(() => {
    if (discussion?._id) {
      fetchDiscussionDetails();
    }
  }, [discussion?._id]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (showActions) {
          setShowActions(false);
        } else if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, showActions, showDeleteConfirm]);

  // Handle click outside to close actions menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActions && !event.target.closest(".action-menu")) {
        setShowActions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showActions]);

  const fetchDiscussionDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await discussionService.getDiscussion(discussion._id);

      if (result.success) {
        setReplies(result.data.replies || []);
        setPagination(result.data.pagination || {});
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to load discussion details");
      console.error("Error fetching discussion details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Organize replies into threaded structure
  const organizeReplies = (replies) => {
    const replyMap = new Map();
    const topLevelReplies = [];

    // First pass: create a map of all replies
    replies.forEach((reply) => {
      replyMap.set(reply._id, { ...reply, replies: [] });
    });

    // Second pass: organize into hierarchy
    replies.forEach((reply) => {
      if (reply.parentReply) {
        // Handle both ObjectId and string formats for parentReply
        const parentId =
          typeof reply.parentReply === "object"
            ? reply.parentReply._id || reply.parentReply
            : reply.parentReply;

        const parent = replyMap.get(parentId);
        if (parent) {
          parent.replies.push(replyMap.get(reply._id));
        } else {
          // If parent not found, treat as top-level (fallback)
          topLevelReplies.push(replyMap.get(reply._id));
        }
      } else {
        topLevelReplies.push(replyMap.get(reply._id));
      }
    });

    return topLevelReplies;
  };

  // Handle creating a new reply
  const handleCreateReply = async (e) => {
    e.preventDefault();

    if (!newReply.trim()) return;

    try {
      setReplyLoading(true);
      setError("");

      const result = await discussionService.createReply(discussion._id, {
        content: newReply.trim(),
      });

      if (result.success) {
        setNewReply("");
        fetchDiscussionDetails(); // Refresh replies
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to create reply");
      console.error("Error creating reply:", err);
    } finally {
      setReplyLoading(false);
    }
  };

  // Handle reply added callback
  const handleReplyAdded = () => {
    fetchDiscussionDetails();
  };

  // Initialize edit form when discussion changes
  useEffect(() => {
    if (discussion) {
      setEditForm({
        title: discussion.title || "",
        content: discussion.content || "",
        category: discussion.category || "general",
        tags: discussion.tags || [],
      });
    }
  }, [discussion]);

  // Handle pin/unpin discussion
  const handleTogglePin = async () => {
    try {
      setActionLoading(true);
      const result = await discussionService.togglePinDiscussion(
        discussion._id,
        discussion.isPinned
      );

      if (result.success) {
        // Update local discussion state
        fetchDiscussionDetails();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to update pin status");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle lock/unlock discussion
  const handleToggleLock = async () => {
    try {
      setActionLoading(true);
      const result = await discussionService.toggleLockDiscussion(
        discussion._id,
        discussion.isLocked
      );

      if (result.success) {
        fetchDiscussionDetails();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to update lock status");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete discussion
  const handleDeleteDiscussion = async () => {
    try {
      setActionLoading(true);
      const result = await discussionService.deleteDiscussion(discussion._id);

      if (result.success) {
        onClose(); // Close the modal and return to discussions list
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to delete discussion");
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Check if current user can manage the discussion
  const canManageDiscussion =
    user &&
    (user._id === discussion?.author?._id ||
      user._id === discussion?.group?.owner);

  // Get category info
  const categoryInfo = discussionService.getCategoryInfo(discussion?.category);

  if (!discussion) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-6xl h-[95vh] shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transform transition-all duration-300 scale-100">
          {/* Header - Compact */}
          <div className="flex-shrink-0 px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Groups</span>
              <span>/</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {discussion.group?.name || "Group"}
              </span>
              <span>/</span>
              <span>Discussions</span>
              <span>/</span>
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs">
                {discussion.title}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 group bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600"
              >
                <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Discussions</span>
              </button>

              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800 dark:bg-${categoryInfo.color}-900/30 dark:text-${categoryInfo.color}-300`}
                >
                  {categoryInfo.label}
                </span>
                {discussion.isPinned && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    📌 Pinned
                  </span>
                )}
                {discussion.isLocked && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    🔒 Locked
                  </span>
                )}

                {/* Action Menu */}
                {canManageDiscussion && (
                  <div className="relative action-menu">
                    <button
                      onClick={() => setShowActions(!showActions)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>

                    {showActions && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setShowEditModal(true);
                              setShowActions(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <PencilIcon className="h-4 w-4 mr-3" />
                            Edit Discussion
                          </button>

                          <button
                            onClick={() => {
                              handleTogglePin();
                              setShowActions(false);
                            }}
                            disabled={actionLoading}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                          >
                            <StarIconSolid className="h-4 w-4 mr-3" />
                            {discussion.isPinned ? "Unpin" : "Pin"} Discussion
                          </button>

                          <button
                            onClick={() => {
                              handleToggleLock();
                              setShowActions(false);
                            }}
                            disabled={actionLoading}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                          >
                            {discussion.isLocked ? (
                              <LockOpenIcon className="h-4 w-4 mr-3" />
                            ) : (
                              <LockClosedIcon className="h-4 w-4 mr-3" />
                            )}
                            {discussion.isLocked ? "Unlock" : "Lock"} Discussion
                          </button>

                          <hr className="my-1 border-gray-200 dark:border-gray-600" />

                          <button
                            onClick={() => {
                              setShowDeleteConfirm(true);
                              setShowActions(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <TrashIcon className="h-4 w-4 mr-3" />
                            Delete Discussion
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Discussion Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-8 py-6">
              {/* Discussion Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  {discussion.title}
                </h1>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4" />
                      <span className="font-medium">
                        {discussion.author?.firstName}{" "}
                        {discussion.author?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        Created{" "}
                        {discussionService.formatTimeAgo(discussion.createdAt)}
                      </span>
                    </div>
                    {discussion.lastActivity &&
                      discussion.lastActivity !== discussion.createdAt && (
                        <div className="flex items-center space-x-2">
                          <span>•</span>
                          <span>
                            Last activity{" "}
                            {discussionService.formatTimeAgo(
                              discussion.lastActivity
                            )}
                          </span>
                        </div>
                      )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      <span>{replies.length} replies</span>
                    </div>
                    {discussion.tags && discussion.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        {discussion.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                        {discussion.tags.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{discussion.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Discussion Content */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-8">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-lg leading-relaxed">
                      {discussion.content}
                    </p>
                  </div>
                </div>
              </div>

              {/* Replies Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8 px-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <ChatBubbleLeftRightIcon className="h-7 w-7 mr-3 text-blue-500" />
                  Replies ({replies.length})
                </h3>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-4">
                    <p className="text-red-600 dark:text-red-400">⚠️ {error}</p>
                  </div>
                )}

                {/* Loading State */}
                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    {/* Replies List */}
                    <div className="space-y-4 mb-6">
                      {replies.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No replies yet. Be the first to reply!</p>
                        </div>
                      ) : (
                        organizeReplies(replies).map((reply) => (
                          <ReplyItem
                            key={reply._id}
                            reply={reply}
                            level={0}
                            onReplyAdded={handleReplyAdded}
                            discussionId={discussion._id}
                          />
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Reply Form - Compact */}
          {discussion.isLocked !== true ? (
            <div className="flex-shrink-0 px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
              <form onSubmit={handleCreateReply} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    💭 Add Your Reply
                  </label>
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Share your thoughts and join the conversation..."
                    rows={2}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none text-sm shadow-sm"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {newReply.length > 0 && (
                      <span>{newReply.length} characters</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newReply.trim() || replyLoading}
                      className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:hover:scale-100 text-sm"
                    >
                      {replyLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      ) : (
                        <PaperAirplaneIcon className="h-5 w-5 mr-3" />
                      )}
                      {replyLoading ? "Posting Reply..." : "Post Reply"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-shrink-0 px-8 py-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="text-center py-8">
                <LockClosedIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Discussion Locked
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  This discussion has been locked. No new replies can be added.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center mb-6">
              <TrashIcon className="h-8 w-8 text-red-500 mr-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Delete Discussion
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Are you sure you want to delete "{discussion.title}"? This action
              cannot be undone and all replies will be permanently lost.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={actionLoading}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDiscussion}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center space-x-3 shadow-lg"
              >
                {actionLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <TrashIcon className="h-5 w-5" />
                )}
                <span>
                  {actionLoading ? "Deleting..." : "Delete Discussion"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render the modal using a portal to ensure it appears over everything
  return createPortal(modalContent, document.body);
};

export default DiscussionDetail;

import React, { useState, useEffect } from "react";
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  UserIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import paperService from "../services/paperService";
import LoadingSpinner from "./LoadingSpinner";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

const PaperComments = ({ paperId, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [totalComments, setTotalComments] = useState(0);

  // Fetch comments
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await paperService.getComments(paperId);
      if (result.success) {
        setComments(result.data.comments);
        setTotalComments(result.data.totalComments);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to load comments");
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchComments();
  }, [paperId]);

  // Handle new comment
  const handleCommentAdded = () => {
    setShowCommentForm(false);
    fetchComments(); // Refresh comments
  };

  // Handle comment update
  const handleCommentUpdated = () => {
    fetchComments(); // Refresh comments
  };

  // Handle comment delete
  const handleCommentDeleted = () => {
    fetchComments(); // Refresh comments
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Discussion
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalComments} {totalComments === 1 ? "comment" : "comments"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Comment
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <CommentForm
            paperId={paperId}
            onSuccess={handleCommentAdded}
            onCancel={() => setShowCommentForm(false)}
            placeholder="Share your thoughts about this paper..."
          />
        </div>
      )}

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Minimal bottom padding since footer is hidden */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
              <p className="text-red-600 dark:text-red-400">⚠️ {error}</p>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 px-6">
            <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No comments yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to share your thoughts about this paper!
            </p>
            <button
              onClick={() => setShowCommentForm(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add First Comment
            </button>
          </div>
        ) : (
          <div className="p-4 pb-6 space-y-4">
            {/* Normal padding since footer is hidden on comments tab */}
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                paperId={paperId}
                currentUser={user}
                onUpdate={handleCommentUpdated}
                onDelete={handleCommentDeleted}
                level={0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {!loading && comments.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <UserIcon className="h-4 w-4" />
                <span>
                  {
                    new Set(
                      comments.flatMap((c) => [
                        c.user._id,
                        ...(c.replies?.map((r) => r.user._id) || []),
                      ])
                    ).size
                  }{" "}
                  participants
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span>{totalComments} total comments</span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>
                Last activity{" "}
                {paperService.formatTimeAgo(
                  Math.max(
                    ...comments.flatMap((c) => [
                      new Date(c.createdAt).getTime(),
                      ...(c.replies?.map((r) =>
                        new Date(r.createdAt).getTime()
                      ) || []),
                    ])
                  )
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperComments;

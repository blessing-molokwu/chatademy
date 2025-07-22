import React, { useState } from "react";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import paperService from "../services/paperService";
import LoadingSpinner from "./LoadingSpinner";

const CommentForm = ({
  paperId,
  parentCommentId = null,
  onSuccess,
  onCancel,
  placeholder = "Write a comment...",
  isReply = false,
  initialContent = "",
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please enter a comment");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const result = await paperService.addComment(
        paperId,
        content.trim(),
        parentCommentId
      );

      if (result.success) {
        setContent("");
        onSuccess(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to add comment");
      console.error("Error adding comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setContent("");
    setError("");
    if (onCancel) {
      onCancel();
    }
  };

  // Handle key press (Ctrl+Enter to submit)
  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div
      className={`${
        isReply ? "bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4" : ""
      }`}
    >
      {/* User Avatar and Name */}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </span>
          </div>
        </div>

        <div className="flex-1">
          {/* Reply indicator */}
          {isReply && (
            <div className="mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                💬 Replying as{" "}
                <span className="font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
              </span>
            </div>
          )}

          {/* Comment Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                rows={isReply ? 2 : 3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none text-sm"
                disabled={submitting}
                maxLength={1000}
              />

              {/* Character count */}
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {content.length}/1000
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  ⚠️ {error}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              {!isReply && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Tip: Press Ctrl+Enter to submit quickly
                </div>
              )}

              <div
                className={`flex items-center space-x-2 ${
                  isReply ? "w-full justify-end" : ""
                }`}
              >
                {onCancel && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className={`inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors disabled:opacity-50 ${
                      isReply ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"
                    }`}
                  >
                    <XMarkIcon
                      className={`mr-1 ${isReply ? "h-3 w-3" : "h-4 w-4"}`}
                    />
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!content.trim() || submitting}
                  className={`inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 disabled:transform-none disabled:hover:scale-100 ${
                    isReply ? "px-4 py-1 text-xs" : "px-6 py-2 text-sm"
                  }`}
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">
                        {isReply ? "Replying..." : "Posting..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon
                        className={`mr-2 ${isReply ? "h-3 w-3" : "h-4 w-4"}`}
                      />
                      {isReply ? "Reply" : "Comment"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;

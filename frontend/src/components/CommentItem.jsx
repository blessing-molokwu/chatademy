import React, { useState } from "react";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import paperService from "../services/paperService";
import CommentForm from "./CommentForm";

const CommentItem = ({
  comment,
  paperId,
  currentUser,
  onUpdate,
  onDelete,
  level = 0,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Check if current user liked this comment
  const isLiked = comment.likes?.some((like) => {
    const likeUserId = like.user._id || like.user.id || like.user;
    const currentUserId = currentUser._id || currentUser.id;
    return likeUserId.toString() === currentUserId.toString();
  });

  // Check if current user can edit/delete this comment
  const canEdit = comment.user._id === (currentUser._id || currentUser.id);
  const canDelete = canEdit; // For now, only comment author can delete

  // Handle like/unlike
  const handleLike = async () => {
    try {
      setLiking(true);
      const result = await paperService.likeComment(paperId, comment._id);
      if (result.success) {
        onUpdate(); // Refresh comments
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    } finally {
      setLiking(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setDeleting(true);
      const result = await paperService.deleteComment(paperId, comment._id);
      if (result.success) {
        onDelete();
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setDeleting(false);
    }
  };

  // Handle reply success
  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onUpdate();
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setShowEditForm(false);
    onUpdate();
  };

  // Calculate indentation based on nesting level
  const maxLevel = 3; // Maximum nesting level
  const actualLevel = Math.min(level, maxLevel);
  const indentClass = actualLevel > 0 ? `ml-${actualLevel * 4}` : "";

  return (
    <div
      className={`${indentClass} ${
        level > 0 ? "border-l-2 border-gray-200 dark:border-gray-600 pl-4" : ""
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm transition-shadow">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {comment.user.firstName?.[0]}
                {comment.user.lastName?.[0]}
              </span>
            </div>

            {/* User Info */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {comment.user.firstName} {comment.user.lastName}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                    (edited)
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <ClockIcon className="h-3 w-3" />
                <span>{paperService.formatTimeAgo(comment.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {(canEdit || canDelete) && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
              >
                <EllipsisHorizontalIcon className="h-4 w-4" />
              </button>

              {showActions && (
                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="py-1">
                    {canEdit && (
                      <button
                        onClick={() => {
                          setShowEditForm(true);
                          setShowActions(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowActions(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment Content */}
        {showEditForm ? (
          <div className="mb-4">
            <CommentForm
              paperId={paperId}
              onSuccess={handleEditSuccess}
              onCancel={() => setShowEditForm(false)}
              placeholder="Edit your comment..."
              initialContent={comment.content}
              isReply={true}
            />
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-gray-900 dark:text-white text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        )}

        {/* Comment Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 hover:scale-105 ${
                isLiked
                  ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              }`}
            >
              {isLiked ? (
                <HeartIconSolid className="h-4 w-4" />
              ) : (
                <HeartIcon className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">
                {comment.likes?.length || 0}
              </span>
            </button>

            {/* Reply Button */}
            {level < maxLevel && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center space-x-1 px-2 py-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-105"
              >
                <ChatBubbleLeftIcon className="h-4 w-4" />
                <span className="text-xs font-medium">Reply</span>
              </button>
            )}
          </div>

          {/* Reply Count */}
          {comment.replies && comment.replies.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {comment.replies.length}{" "}
              {comment.replies.length === 1 ? "reply" : "replies"}
            </span>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <CommentForm
              paperId={paperId}
              parentCommentId={comment._id}
              onSuccess={handleReplySuccess}
              onCancel={() => setShowReplyForm(false)}
              placeholder={`Reply to ${comment.user.firstName}...`}
              isReply={true}
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              paperId={paperId}
              currentUser={currentUser}
              onUpdate={onUpdate}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center mb-4">
              <TrashIcon className="h-8 w-8 text-red-500 mr-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Delete Comment
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentItem;

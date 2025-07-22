import React, { useState } from "react";
import {
  UserIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import discussionService from "../services/discussionService";
import LoadingSpinner from "./LoadingSpinner";

const ReplyItem = ({ 
  reply, 
  level = 0, 
  onReplyAdded, 
  discussionId,
  maxNestingLevel = 3 
}) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [newReply, setNewReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle creating a nested reply
  const handleCreateReply = async (e) => {
    e.preventDefault();
    
    if (!newReply.trim()) return;
    
    try {
      setReplyLoading(true);
      setError("");
      
      const result = await discussionService.createReply(discussionId, {
        content: newReply.trim(),
        parentReply: reply._id,
      });
      
      if (result.success) {
        setNewReply("");
        setShowReplyForm(false);
        onReplyAdded(); // Refresh the discussion
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

  // Calculate indentation based on nesting level
  const indentationClass = level > 0 ? `ml-${Math.min(level * 6, 12)}` : "";
  const isMaxNested = level >= maxNestingLevel;

  return (
    <div className={`${indentationClass} ${level > 0 ? 'border-l-2 border-gray-200 dark:border-gray-600 pl-4' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
        {/* Reply Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <UserIcon className="h-4 w-4" />
              <span className="font-medium">
                {reply.author?.firstName} {reply.author?.lastName}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>
                {discussionService.formatTimeAgo(reply.createdAt)}
              </span>
            </div>
            {reply.isEdited && (
              <>
                <span>•</span>
                <span className="text-xs italic">edited</span>
              </>
            )}
          </div>
          
          {/* Reply Actions */}
          <div className="flex items-center space-x-2">
            {!isMaxNested && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors"
              >
                Reply
              </button>
            )}
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Reply Content */}
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
            {reply.content}
          </p>
        </div>
        
        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-3">
                <p className="text-red-600 dark:text-red-400 text-sm">⚠️ {error}</p>
              </div>
            )}
            
            <form onSubmit={handleCreateReply} className="space-y-3">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder={`Reply to ${reply.author?.firstName}...`}
                rows={2}
                className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none text-sm"
              />
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(false);
                    setNewReply("");
                    setError("");
                  }}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newReply.trim() || replyLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-1 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-1 text-sm disabled:cursor-not-allowed"
                >
                  {replyLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <PaperAirplaneIcon className="h-4 w-4" />
                  )}
                  <span>{replyLoading ? "Posting..." : "Reply"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      
      {/* Nested Replies */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="space-y-2">
          {reply.replies.map((nestedReply) => (
            <ReplyItem
              key={nestedReply._id}
              reply={nestedReply}
              level={level + 1}
              onReplyAdded={onReplyAdded}
              discussionId={discussionId}
              maxNestingLevel={maxNestingLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplyItem;

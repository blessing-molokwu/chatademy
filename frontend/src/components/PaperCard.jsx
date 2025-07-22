import React, { useState } from "react";
import {
  DocumentArrowDownIcon,
  EyeIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import paperService from "../services/paperService";
import PaperDetailModal from "./PaperDetailModal";

const PaperCard = ({ paper, onUpdate, canDelete = false }) => {
  const [downloading, setDownloading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Get category info
  const categoryInfo = paperService.getCategoryInfo(paper.category);

  // Handle download
  const handleDownload = async () => {
    try {
      setDownloading(true);
      const result = await paperService.downloadPaper(
        paper._id,
        paper.originalFileName
      );
      if (!result.success) {
        console.error("Download failed:", result.message);
      }
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setDownloading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setDeleting(true);
      const result = await paperService.deletePaper(paper._id);
      if (result.success) {
        onUpdate();
      } else {
        console.error("Delete failed:", result.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Render star rating
  const renderStarRating = (rating, size = "h-4 w-4") => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className={`${size} text-yellow-400`} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className={`${size} text-gray-300 dark:text-gray-600`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <StarIconSolid className={`${size} text-yellow-400`} />
            </div>
          </div>
        );
      } else {
        stars.push(
          <StarIcon
            key={i}
            className={`${size} text-gray-300 dark:text-gray-600`}
          />
        );
      }
    }
    return stars;
  };

  // Calculate average rating
  const averageRating =
    paper.ratings && paper.ratings.length > 0
      ? paper.ratings.reduce((sum, r) => sum + r.rating, 0) /
        paper.ratings.length
      : 0;

  // Check if paper is popular (high downloads or ratings)
  const isPopular = (paper.downloadCount || 0) > 10 || averageRating >= 4.0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden group h-full flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <span className="text-2xl">
                {paperService.getFileIcon(paper.mimeType)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.bgColor} ${categoryInfo.textColor}`}
                >
                  {categoryInfo.icon} {categoryInfo.name}
                </span>
                {isPopular && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm">
                    🏆 Popular
                  </span>
                )}
                {paper.isPublic && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                    🌐 Public
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {canDelete && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>

              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <TrashIcon className="h-4 w-4 mr-3" />
                      Delete Paper
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
          {paper.title}
        </h3>

        {/* Description */}
        <div className="h-16 mb-4">
          {paper.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
              {paper.description}
            </p>
          )}
        </div>

        {/* Authors */}
        {paper.authors && paper.authors.length > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            <UserIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {paper.authors
                .slice(0, 2)
                .map((author) => author.name)
                .join(", ")}
              {paper.authors.length > 2 && ` +${paper.authors.length - 2} more`}
            </span>
          </div>
        )}

        {/* Tags */}
        {paper.tags && paper.tags.length > 0 && (
          <div className="flex items-center space-x-2 mb-4">
            <TagIcon className="h-4 w-4 text-gray-500" />
            <div className="flex flex-wrap gap-1">
              {paper.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md"
                >
                  #{tag}
                </span>
              ))}
              {paper.tags.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{paper.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            {/* Rating */}
            {averageRating > 0 && (
              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {renderStarRating(averageRating)}
                </div>
                <span className="text-xs font-medium">
                  {averageRating.toFixed(1)} ({paper.ratings?.length || 0})
                </span>
              </div>
            )}

            {/* Views */}
            <div className="flex items-center space-x-1">
              <EyeIcon className="h-4 w-4" />
              <span>{paper.viewCount || 0}</span>
            </div>

            {/* Downloads */}
            <div className="flex items-center space-x-1">
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>{paper.downloadCount || 0}</span>
            </div>

            {/* Comments */}
            <div className="flex items-center space-x-1">
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              <span>{paper.comments?.length || 0}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(paper.fileSize)}
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-1">
            <UserIcon className="h-3 w-3" />
            <span>
              {paper.uploadedBy?.firstName} {paper.uploadedBy?.lastName}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-3 w-3" />
            <span>{paperService.formatTimeAgo(paper.createdAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 disabled:transform-none disabled:hover:scale-100 text-sm"
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            )}
            {downloading ? "Downloading..." : "Download"}
          </button>

          <button
            onClick={() => setShowDetailModal(true)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all duration-300 hover:scale-105 text-sm"
            title="View details and comments"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center mb-4">
              <TrashIcon className="h-8 w-8 text-red-500 mr-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Delete Paper
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{paper.title}"? This action
              cannot be undone.
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

      {/* Paper Detail Modal */}
      {showDetailModal && (
        <PaperDetailModal
          paperId={paper._id}
          onClose={() => setShowDetailModal(false)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

export default PaperCard;

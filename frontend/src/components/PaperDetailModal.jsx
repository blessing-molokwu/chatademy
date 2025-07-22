import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  LinkIcon,
  DocumentTextIcon,
  EyeIcon as ViewIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import paperService from "../services/paperService";
import LoadingSpinner from "./LoadingSpinner";
import PaperComments from "./PaperComments";
import PDFViewer from "./PDFViewer";
import DocumentViewer from "./DocumentViewer";
import "./PDFViewer.css";

const PaperDetailModal = ({ paperId, onClose, onUpdate }) => {
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'pdf', 'comments'

  // Fetch paper details
  const fetchPaper = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await paperService.getPaper(paperId);
      if (result.success) {
        setPaper(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to load paper details");
      console.error("Error fetching paper:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPaper();
  }, [paperId]);

  // Handle download
  const handleDownload = async () => {
    if (!paper) return;

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

  // Get category info
  const categoryInfo = paper
    ? paperService.getCategoryInfo(paper.category)
    : null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-6xl h-[90vh] shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <span className="text-2xl">
                  {paper ? paperService.getFileIcon(paper.mimeType) : "📄"}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Paper Details
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  View paper information and discussions
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          {paper && (
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("pdf")}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "pdf"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <ViewIcon className="h-4 w-4 mr-2" />
                View Document
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "comments"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                Comments
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
                  <p className="text-red-600 dark:text-red-400">⚠️ {error}</p>
                </div>
              </div>
            ) : paper ? (
              <>
                {/* Tab Content */}
                <div className="flex-1 overflow-hidden min-h-0">
                  {activeTab === "overview" && (
                    <div className="h-full overflow-y-auto p-6 space-y-6">
                      {/* Title and Category */}
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          {categoryInfo && (
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.bgColor} ${categoryInfo.textColor}`}
                            >
                              {categoryInfo.icon} {categoryInfo.name}
                            </span>
                          )}
                          {paper.isPublic && (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                              🌐 Public
                            </span>
                          )}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                          {paper.title}
                        </h1>
                        {paper.description && (
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {paper.description}
                          </p>
                        )}
                      </div>

                      {/* Authors */}
                      {paper.authors && paper.authors.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            <UserIcon className="h-5 w-5 mr-2" />
                            Authors
                          </h3>
                          <div className="space-y-2">
                            {paper.authors.map((author, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                              >
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {author.name}
                                </div>
                                {author.affiliation && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {author.affiliation}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {paper.tags && paper.tags.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            <TagIcon className="h-5 w-5 mr-2" />
                            Tags
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {paper.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Publication Info */}
                      {(paper.journal ||
                        paper.publishedDate ||
                        paper.doi ||
                        paper.url) && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Publication Details
                          </h3>
                          <div className="space-y-3">
                            {paper.journal && (
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                  Journal:
                                </span>
                                <span className="text-gray-900 dark:text-white">
                                  {paper.journal}
                                </span>
                              </div>
                            )}
                            {paper.publishedDate && (
                              <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                  Published:
                                </span>
                                <span className="text-gray-900 dark:text-white">
                                  {new Date(
                                    paper.publishedDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {paper.doi && (
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                  DOI:
                                </span>
                                <span className="text-gray-900 dark:text-white font-mono text-sm">
                                  {paper.doi}
                                </span>
                              </div>
                            )}
                            {paper.url && (
                              <div className="flex items-center space-x-2">
                                <LinkIcon className="h-4 w-4 text-gray-500" />
                                <a
                                  href={paper.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  View Online
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Statistics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {/* Rating */}
                          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-3 text-center border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center justify-center mb-2">
                              {paper.ratings && paper.ratings.length > 0 ? (
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => {
                                    const avgRating =
                                      paper.ratings.reduce(
                                        (sum, r) => sum + r.rating,
                                        0
                                      ) / paper.ratings.length;
                                    return i < Math.floor(avgRating) ? (
                                      <StarIconSolid
                                        key={i}
                                        className="h-4 w-4 text-yellow-400"
                                      />
                                    ) : (
                                      <StarIcon
                                        key={i}
                                        className="h-4 w-4 text-gray-300 dark:text-gray-600"
                                      />
                                    );
                                  })}
                                </div>
                              ) : (
                                <StarIcon className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                              {paper.ratings && paper.ratings.length > 0
                                ? (
                                    paper.ratings.reduce(
                                      (sum, r) => sum + r.rating,
                                      0
                                    ) / paper.ratings.length
                                  ).toFixed(1)
                                : "N/A"}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {paper.ratings?.length || 0} rating
                              {paper.ratings?.length !== 1 ? "s" : ""}
                            </div>
                          </div>

                          {/* Views */}
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center mb-2">
                              <EyeIcon className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                              {paper.viewCount || 0}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Views
                            </div>
                          </div>

                          {/* Downloads */}
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center mb-2">
                              <DocumentArrowDownIcon className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                              {paper.downloadCount || 0}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Downloads
                            </div>
                          </div>

                          {/* Comments */}
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center mb-2">
                              <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-500" />
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                              {paper.comments?.length || 0}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Comments
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          File Information
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Original Filename
                            </div>
                            <div className="text-sm text-gray-900 dark:text-white font-mono break-all">
                              {paper.originalFileName}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              File size:
                            </span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {paperService.formatFileSize(paper.fileSize)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Upload Info */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            Uploaded by{" "}
                            <span className="font-medium">
                              {paper.uploadedBy?.firstName}{" "}
                              {paper.uploadedBy?.lastName}
                            </span>
                          </div>
                          <div>
                            {paperService.formatTimeAgo(paper.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "pdf" && (
                    <div className="h-full">
                      <DocumentViewer
                        fileUrl={`http://localhost:5000/api/papers/${paper._id}/download`}
                        fileName={paper.originalFileName}
                        mimeType={paper.mimeType}
                      />
                    </div>
                  )}

                  {activeTab === "comments" && (
                    <div className="h-full">
                      <PaperComments paperId={paperId} />
                    </div>
                  )}
                </div>

                {/* Footer - Only show on overview and PDF tabs */}
                {paper && activeTab !== "comments" && (
                  <div className="flex justify-end items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex space-x-3">
                      <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:hover:scale-100"
                      >
                        {downloading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span className="ml-2">Downloading...</span>
                          </>
                        ) : (
                          <>
                            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                            Download Paper
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PaperDetailModal;

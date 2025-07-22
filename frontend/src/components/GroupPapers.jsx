import React, { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import paperService from "../services/paperService";
import LoadingSpinner from "./LoadingSpinner";
import PaperUploadModal from "./PaperUploadModal";
import PaperCard from "./PaperCard";

const GroupPapers = ({ groupId, group }) => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pagination, setPagination] = useState({});
  const [popularTags, setPopularTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Categories for filtering
  const categories = [
    { id: "all", name: "All Papers", icon: "📚" },
    { id: "research", name: "Research", icon: "🔬" },
    { id: "review", name: "Review", icon: "📖" },
    { id: "thesis", name: "Thesis", icon: "🎓" },
    { id: "conference", name: "Conference", icon: "🎤" },
    { id: "journal", name: "Journal", icon: "📚" },
    { id: "preprint", name: "Preprint", icon: "📋" },
    { id: "other", name: "Other", icon: "📄" },
  ];

  // Fetch papers
  const fetchPapers = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const result = await paperService.getPapers(groupId, {
        page,
        limit: 12,
        category: selectedCategory,
        search: searchTerm,
        tags: selectedTags.join(","),
      });

      if (result.success) {
        setPapers(result.data.papers);
        setPagination(result.data.pagination);
        setPopularTags(result.data.popularTags || []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to load papers");
      console.error("Error fetching papers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPapers(1);
    setCurrentPage(1);
  }, [groupId, selectedCategory, searchTerm, selectedTags]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchPapers(1);
    setCurrentPage(1);
  };

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  // Handle tag toggle
  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  // Handle paper upload success
  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchPapers(currentPage);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPapers(page);
  };

  // Check if user can upload papers
  const canUploadPapers =
    group &&
    (group.owner._id === (user._id || user.id) ||
      group.members.some(
        (member) => member.user._id === (user._id || user.id)
      ));

  return (
    <div className="space-y-6">
      {/* Header with Search and Upload */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <DocumentTextIcon className="h-7 w-7 mr-3 text-blue-500" />
            Research Papers
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Share and discover research papers with your group
          </p>
        </div>

        {canUploadPapers && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Upload Paper
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search papers by title, description, or authors..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </form>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Categories
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                } flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <TagIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Popular Tags
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tagData) => (
                <button
                  key={tagData.tag}
                  onClick={() => handleTagToggle(tagData.tag)}
                  className={`${
                    selectedTags.includes(tagData.tag)
                      ? "bg-gradient-to-r from-green-500 to-teal-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  } px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105`}
                >
                  #{tagData.tag} ({tagData.count})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Popular Papers Section */}
      {!loading && papers.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800 mb-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🏆</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Popular Papers
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Most downloaded and highly rated papers in this group
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {papers
              .filter((paper) => {
                const avgRating =
                  paper.ratings && paper.ratings.length > 0
                    ? paper.ratings.reduce((sum, r) => sum + r.rating, 0) /
                      paper.ratings.length
                    : 0;
                return (paper.downloadCount || 0) > 5 || avgRating >= 4.0;
              })
              .slice(0, 3)
              .map((paper) => {
                const avgRating =
                  paper.ratings && paper.ratings.length > 0
                    ? paper.ratings.reduce((sum, r) => sum + r.rating, 0) /
                      paper.ratings.length
                    : 0;
                return (
                  <div
                    key={paper._id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-300 dark:border-yellow-700 shadow-sm"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                        <span className="text-lg">
                          {paperService.getFileIcon(paper.mimeType)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
                          {paper.title}
                        </h4>
                        <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                          {avgRating > 0 && (
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-500">⭐</span>
                              <span>{avgRating.toFixed(1)}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <span>📥</span>
                            <span>{paper.downloadCount || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>👁️</span>
                            <span>{paper.viewCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {papers.filter((paper) => {
            const avgRating =
              paper.ratings && paper.ratings.length > 0
                ? paper.ratings.reduce((sum, r) => sum + r.rating, 0) /
                  paper.ratings.length
                : 0;
            return (paper.downloadCount || 0) > 5 || avgRating >= 4.0;
          }).length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No popular papers yet. Upload and rate papers to see them here!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400">⚠️ {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Papers Grid */}
          {papers.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No papers found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm ||
                selectedTags.length > 0 ||
                selectedCategory !== "all"
                  ? "Try adjusting your search or filters"
                  : "Be the first to upload a research paper!"}
              </p>
              {canUploadPapers && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                  Upload First Paper
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {papers.map((paper) => (
                <PaperCard
                  key={paper._id}
                  paper={paper}
                  onUpdate={() => fetchPapers(currentPage)}
                  canDelete={
                    paper.uploadedBy._id === user._id ||
                    group?.owner._id === user._id
                  }
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      currentPage === page
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <PaperUploadModal
          groupId={groupId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default GroupPapers;

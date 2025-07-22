import { useState, useRef, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import ModernCard from "./ModernCard";
import { useToast } from "../contexts/ToastContext";

const GlobalSearch = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    type: "all",
    dateRange: "all",
    status: "all",
  });
  const [recentSearches, setRecentSearches] = useState([
    "AI Healthcare Research",
    "Machine Learning Dataset",
    "Quantum Computing",
    "Data Analysis",
  ]);
  const searchInputRef = useRef(null);

  // Mock search results
  const searchResults = [
    {
      id: 1,
      type: "paper",
      title: "AI in Healthcare: A Comprehensive Study",
      description:
        "Research paper on artificial intelligence applications in healthcare systems...",
      author: "Dr. Sarah Chen",
      date: "2024-01-15",
      icon: DocumentTextIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      url: "/papers",
    },
    {
      id: 2,
      type: "group",
      title: "Machine Learning Research Group",
      description:
        "Collaborative research group focused on machine learning algorithms and applications...",
      author: "Prof. Michael Johnson",
      date: "2024-01-14",
      icon: UserGroupIcon,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      url: "/groups",
    },

    {
      id: 4,
      type: "file",
      title: "Healthcare_Dataset.csv",
      description:
        "Large dataset containing healthcare records for machine learning analysis...",
      author: "Dr. Emily Rodriguez",
      date: "2024-01-12",
      icon: FolderIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      url: "/files",
    },
  ];

  const filterTypes = [
    { id: "all", name: "All Types", icon: ChartBarIcon },
    { id: "paper", name: "Papers", icon: DocumentTextIcon },
    { id: "group", name: "Groups", icon: UserGroupIcon },
    { id: "milestone", name: "Milestones", icon: ClipboardDocumentListIcon },
    { id: "file", name: "Files", icon: FolderIcon },
  ];

  const dateRanges = [
    { id: "all", name: "All Time" },
    { id: "today", name: "Today" },
    { id: "week", name: "This Week" },
    { id: "month", name: "This Month" },
    { id: "year", name: "This Year" },
  ];

  // Filter results based on search term and filters
  const filteredResults = searchResults.filter((result) => {
    const matchesSearch =
      searchTerm === "" ||
      result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedFilters.type === "all" || result.type === selectedFilters.type;

    return matchesSearch && matchesType;
  });

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle search submission
  const handleSearch = (term = searchTerm) => {
    if (term.trim()) {
      // Add to recent searches
      setRecentSearches((prev) => {
        const updated = [term, ...prev.filter((s) => s !== term)].slice(0, 5);
        return updated;
      });

      // Navigate to search results page
      navigate(`/search?q=${encodeURIComponent(term)}`);
      onClose();
    }
  };

  // Handle result click
  const handleResultClick = (result) => {
    navigate(result.url);
    onClose();
    toast.success(`Opening ${result.title}`);
  };

  // Handle recent search click
  const handleRecentSearchClick = (term) => {
    setSearchTerm(term);
    handleSearch(term);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full mt-20 max-h-[80vh] overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search papers, groups, milestones, files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-3 ml-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                showFilters
                  ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {filterTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() =>
                        setSelectedFilters((prev) => ({
                          ...prev,
                          type: type.id,
                        }))
                      }
                      className={`flex items-center p-2 rounded-lg text-sm transition-colors duration-200 ${
                        selectedFilters.type === type.id
                          ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      <type.icon className="h-4 w-4 mr-2" />
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <select
                  value={selectedFilters.dateRange}
                  onChange={(e) =>
                    setSelectedFilters((prev) => ({
                      ...prev,
                      dateRange: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {dateRanges.map((range) => (
                    <option key={range.id} value={range.id}>
                      {range.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={selectedFilters.status}
                  onChange={(e) =>
                    setSelectedFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Search Content */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {searchTerm === "" ? (
            /* Recent Searches */
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <ClockIcon className="h-4 w-4 mr-2" />
                Recent Searches
              </h3>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <span className="text-gray-900 dark:text-white">
                      {search}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Search Results */
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search Results ({filteredResults.length})
                </h3>
                {filteredResults.length > 0 && (
                  <button
                    onClick={() => handleSearch()}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    View All Results
                  </button>
                )}
              </div>

              {filteredResults.length === 0 ? (
                <div className="text-center py-8">
                  <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No results found for "{searchTerm}"
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`${result.bgColor} p-2 rounded-lg flex-shrink-0`}
                        >
                          <result.icon className={`h-5 w-5 ${result.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {result.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {result.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{result.author}</span>
                            <span>{result.date}</span>
                            <span className="capitalize">{result.type}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;

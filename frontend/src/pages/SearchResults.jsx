import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  EyeIcon,
  ShareIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import ModernCard from "../components/ModernCard";
import ModernButton from "../components/ModernButton";
import AdvancedSearch from "../components/AdvancedSearch";
import { useToast } from "../contexts/ToastContext";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("list");

  // Mock comprehensive search results
  const allResults = [
    {
      id: 1,
      type: "paper",
      title:
        "AI in Healthcare: A Comprehensive Study on Machine Learning Applications",
      description:
        "This research paper explores the various applications of artificial intelligence in healthcare systems, focusing on diagnostic tools, treatment recommendations, and patient care optimization. The study covers recent advances in deep learning, natural language processing, and computer vision in medical contexts.",
      author: "Dr. Sarah Chen",
      date: "2024-01-15",
      relevanceScore: 95,
      icon: DocumentTextIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      url: "/papers/1",
      metadata: {
        citations: 45,
        downloads: 1200,
        status: "published",
        tags: ["AI", "Healthcare", "Machine Learning"],
      },
    },
    {
      id: 2,
      type: "group",
      title: "Machine Learning Research Collaborative",
      description:
        "A dynamic research group bringing together experts from computer science, statistics, and domain-specific fields to advance machine learning methodologies. Current projects include reinforcement learning, neural architecture search, and federated learning systems.",
      author: "Prof. Michael Johnson",
      date: "2024-01-14",
      relevanceScore: 88,
      icon: UserGroupIcon,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      url: "/groups/2",
      metadata: {
        members: 24,
        projects: 8,
        status: "active",
        tags: ["Machine Learning", "Collaboration", "Research"],
      },
    },

    {
      id: 4,
      type: "file",
      title: "Healthcare_ML_Dataset_v2.csv",
      description:
        "Comprehensive healthcare dataset containing patient demographics, medical history, diagnostic results, and treatment outcomes. Preprocessed and cleaned for machine learning applications with proper anonymization protocols.",
      author: "Dr. Emily Rodriguez",
      date: "2024-01-12",
      relevanceScore: 79,
      icon: FolderIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      url: "/files/4",
      metadata: {
        size: "45.7 MB",
        downloads: 89,
        status: "shared",
        tags: ["Dataset", "Healthcare", "CSV"],
      },
    },
    {
      id: 5,
      type: "paper",
      title: "Quantum Computing Applications in Machine Learning Optimization",
      description:
        "Exploring the potential of quantum computing to solve complex optimization problems in machine learning. This paper presents novel quantum algorithms for neural network training and discusses their theoretical advantages over classical methods.",
      author: "Prof. David Kim",
      date: "2024-01-10",
      relevanceScore: 75,
      icon: DocumentTextIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      url: "/papers/5",
      metadata: {
        citations: 23,
        downloads: 567,
        status: "published",
        tags: ["Quantum Computing", "Machine Learning", "Optimization"],
      },
    },
    {
      id: 6,
      type: "group",
      title: "Quantum AI Research Initiative",
      description:
        "Interdisciplinary research group focused on the intersection of quantum computing and artificial intelligence. Working on quantum machine learning algorithms, quantum neural networks, and hybrid classical-quantum systems.",
      author: "Dr. Lisa Wang",
      date: "2024-01-08",
      relevanceScore: 71,
      icon: UserGroupIcon,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      url: "/groups/6",
      metadata: {
        members: 12,
        projects: 4,
        status: "active",
        tags: ["Quantum Computing", "AI", "Research"],
      },
    },
  ];

  const categories = [
    {
      id: "all",
      name: "All Results",
      icon: ChartBarIcon,
      count: allResults.length,
    },
    {
      id: "paper",
      name: "Papers",
      icon: DocumentTextIcon,
      count: allResults.filter((r) => r.type === "paper").length,
    },
    {
      id: "group",
      name: "Groups",
      icon: UserGroupIcon,
      count: allResults.filter((r) => r.type === "group").length,
    },
    {
      id: "milestone",
      name: "Milestones",
      icon: ClipboardDocumentListIcon,
      count: allResults.filter((r) => r.type === "milestone").length,
    },
    {
      id: "file",
      name: "Files",
      icon: FolderIcon,
      count: allResults.filter((r) => r.type === "file").length,
    },
  ];

  const sortOptions = [
    { id: "relevance", name: "Relevance" },
    { id: "date", name: "Date" },
    { id: "title", name: "Title" },
    { id: "author", name: "Author" },
  ];

  // Filter and sort results
  const filteredResults = allResults
    .filter((result) => {
      const matchesCategory =
        selectedCategory === "all" || result.type === selectedCategory;
      const matchesSearch =
        searchTerm === "" ||
        result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.metadata.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date) - new Date(a.date);
        case "title":
          return a.title.localeCompare(b.title);
        case "author":
          return a.author.localeCompare(b.author);
        case "relevance":
        default:
          return b.relevanceScore - a.relevanceScore;
      }
    });

  // Update URL when search changes
  useEffect(() => {
    if (searchTerm) {
      setSearchParams({ q: searchTerm });
    } else {
      setSearchParams({});
    }
  }, [searchTerm, setSearchParams]);

  const handleResultClick = (result) => {
    navigate(result.url);
    toast.success(`Opening ${result.title}`);
  };

  const handleResultAction = (action, result) => {
    switch (action) {
      case "view":
        handleResultClick(result);
        break;
      case "share":
        toast.success(`Sharing ${result.title}`);
        break;
      case "bookmark":
        toast.success(`Bookmarked ${result.title}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Search Results
        </h1>
        {searchTerm && (
          <p className="text-gray-600 dark:text-gray-400">
            {filteredResults.length} results for "{searchTerm}"
          </p>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <AdvancedSearch
          placeholder="Search papers, groups, milestones, files..."
          onSearch={(term) => setSearchTerm(term)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories and Filters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors duration-200 ${
                    selectedCategory === category.id
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <category.icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </ModernCard>

          {/* Sort Options */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sort By
            </h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </ModernCard>
        </div>

        {/* Main Results */}
        <div className="lg:col-span-3">
          <ModernCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedCategory === "all"
                  ? "All Results"
                  : categories.find((c) => c.id === selectedCategory)?.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredResults.length} results
                </span>
              </div>
            </div>

            {filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No results found
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`${result.bgColor} p-3 rounded-lg flex-shrink-0`}
                      >
                        <result.icon className={`h-6 w-6 ${result.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4
                              className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                              onClick={() => handleResultClick(result)}
                            >
                              {result.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                              {result.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                              <span>{result.author}</span>
                              <span>{result.date}</span>
                              <span className="capitalize">{result.type}</span>
                              <span>Relevance: {result.relevanceScore}%</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {result.metadata.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleResultAction("view", result)}
                              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                              title="View"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleResultAction("share", result)
                              }
                              className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                              title="Share"
                            >
                              <ShareIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleResultAction("bookmark", result)
                              }
                              className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-200"
                              title="Bookmark"
                            >
                              <BookmarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModernCard>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;

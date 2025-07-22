import { useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  ShareIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import AdvancedSearch from "../components/AdvancedSearch";
import ModernCard from "../components/ModernCard";
import ModernButton from "../components/ModernButton";
import { useToast } from "../contexts/ToastContext";

const ResearchPapers = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState({});
  const { toast } = useToast();

  // Mock data
  const papers = [
    {
      id: 1,
      title:
        "Machine Learning Applications in Healthcare: A Comprehensive Review",
      authors: ["Dr. Sarah Chen", "Prof. Michael Johnson", "You"],
      group: "AI Ethics Research",
      status: "Published",
      lastModified: "2024-01-10",
      tags: ["Machine Learning", "Healthcare", "Review"],
      collaborators: 3,
      version: "2.1",
      abstract:
        "This paper provides a comprehensive review of machine learning applications in healthcare, covering recent advances and future directions.",
      type: "Research Paper",
    },
    {
      id: 2,
      title: "Quantum Algorithms for Optimization Problems",
      authors: ["You", "Dr. Alice Wang"],
      group: "Quantum Computing Lab",
      status: "In Review",
      lastModified: "2024-01-08",
      tags: ["Quantum Computing", "Optimization", "Algorithms"],
      collaborators: 2,
      version: "1.3",
      abstract:
        "We present novel quantum algorithms for solving complex optimization problems with improved efficiency.",
      type: "Research Paper",
    },
    {
      id: 3,
      title: "Climate Change Impact Analysis Using Statistical Models",
      authors: ["Prof. David Brown", "You", "Dr. Emma Wilson"],
      group: "Climate Data Analysis",
      status: "Draft",
      lastModified: "2024-01-05",
      tags: ["Climate Change", "Statistics", "Data Analysis"],
      collaborators: 3,
      version: "0.8",
      abstract:
        "Statistical analysis of climate data to understand long-term environmental changes and their implications.",
      type: "Research Paper",
    },
    {
      id: 4,
      title: "Research Proposal: AI Ethics Framework",
      authors: ["You"],
      group: "AI Ethics Research",
      status: "Draft",
      lastModified: "2024-01-03",
      tags: ["AI Ethics", "Framework", "Proposal"],
      collaborators: 1,
      version: "1.0",
      abstract:
        "A comprehensive framework for evaluating ethical implications of AI systems in various domains.",
      type: "Proposal",
    },
  ];

  const tabs = [
    { id: "all", name: "All Papers", count: papers.length },
    {
      id: "my-papers",
      name: "My Papers",
      count: papers.filter((p) => p.authors.includes("You")).length,
    },
    {
      id: "drafts",
      name: "Drafts",
      count: papers.filter((p) => p.status === "Draft").length,
    },
    {
      id: "published",
      name: "Published",
      count: papers.filter((p) => p.status === "Published").length,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Published":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
      case "In Review":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300";
      case "Draft":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const PaperCard = ({ paper }) => (
    <ModernCard className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {paper.title}
            </h3>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                paper.status
              )}`}
            >
              {paper.status}
            </span>
            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
              {paper.type}
            </span>
            <span>v{paper.version}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {paper.abstract}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 mr-1" />
            <span>{paper.collaborators} collaborators</span>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{paper.lastModified}</span>
          </div>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {paper.group}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {paper.tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
          >
            <TagIcon className="h-3 w-3 mr-1" />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ModernButton variant="secondary" size="sm">
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </ModernButton>
          <ModernButton size="sm">
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </ModernButton>
          <button className="flex items-center px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/20 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors">
            <ShareIcon className="h-4 w-4 mr-1" />
            Share
          </button>
        </div>
        <button className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1">
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </ModernCard>
  );

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.authors.some((author) =>
        author.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      paper.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    switch (activeTab) {
      case "my-papers":
        return matchesSearch && paper.authors.includes("You");
      case "drafts":
        return matchesSearch && paper.status === "Draft";
      case "published":
        return matchesSearch && paper.status === "Published";
      default:
        return matchesSearch;
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Research Papers
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage and collaborate on your research documents
          </p>
        </div>
        <ModernButton onClick={() => setShowUploadModal(true)}>
          <div className="flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            <span>New Paper</span>
          </div>
        </ModernButton>
      </div>

      {/* Advanced Search */}
      <div className="mb-6">
        <AdvancedSearch
          placeholder="Search papers, authors, or tags..."
          onSearch={(term, searchFilters) => {
            setSearchTerm(term);
            setFilters(searchFilters);
          }}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
          }}
          filters={filters}
        />

        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                {tab.name}
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPapers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>

      {filteredPapers.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No papers found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by creating your first paper."}
          </p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowUploadModal(false)}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Create New Paper
                </h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paper Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter paper title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="research">Research Paper</option>
                      <option value="proposal">Research Proposal</option>
                      <option value="review">Literature Review</option>
                      <option value="thesis">Thesis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Research Group
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select a group</option>
                      <option value="ai-ethics">AI Ethics Research</option>
                      <option value="quantum">Quantum Computing Lab</option>
                      <option value="climate">Climate Data Analysis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Abstract
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of your research"
                    />
                  </div>
                </form>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  Create Paper
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchPapers;

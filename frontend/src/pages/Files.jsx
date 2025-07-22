import { useState } from "react";
import {
  DocumentIcon,
  FolderIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ShareIcon,
  TrashIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon,
  CalendarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import ModernCard from "../components/ModernCard";
import ModernButton from "../components/ModernButton";
import FileUpload from "../components/FileUpload";
import { useToast } from "../contexts/ToastContext";

const Files = () => {
  const { toast } = useToast();
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Mock file data
  const folders = [
    { id: "all", name: "All Files", count: 24, icon: FolderIcon },
    {
      id: "research-papers",
      name: "Research Papers",
      count: 8,
      icon: DocumentTextIcon,
    },
    {
      id: "presentations",
      name: "Presentations",
      count: 5,
      icon: DocumentIcon,
    },
    { id: "datasets", name: "Datasets", count: 3, icon: ArchiveBoxIcon },
    { id: "images", name: "Images", count: 6, icon: PhotoIcon },
    { id: "videos", name: "Videos", count: 2, icon: VideoCameraIcon },
  ];

  const files = [
    {
      id: 1,
      name: "AI_Healthcare_Research_Paper.pdf",
      type: "pdf",
      size: "2.4 MB",
      uploadedBy: "Dr. Sarah Chen",
      uploadedAt: "2024-01-15",
      folder: "research-papers",
      shared: true,
      icon: DocumentTextIcon,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      id: 2,
      name: "Machine_Learning_Dataset.csv",
      type: "csv",
      size: "15.7 MB",
      uploadedBy: "Prof. Michael Johnson",
      uploadedAt: "2024-01-14",
      folder: "datasets",
      shared: false,
      icon: ArchiveBoxIcon,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      id: 3,
      name: "Research_Presentation.pptx",
      type: "pptx",
      size: "8.2 MB",
      uploadedBy: "Dr. Emily Rodriguez",
      uploadedAt: "2024-01-13",
      folder: "presentations",
      shared: true,
      icon: DocumentIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      id: 4,
      name: "Lab_Equipment_Photo.jpg",
      type: "jpg",
      size: "3.1 MB",
      uploadedBy: "Research Assistant",
      uploadedAt: "2024-01-12",
      folder: "images",
      shared: false,
      icon: PhotoIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      id: 5,
      name: "Experiment_Recording.mp4",
      type: "mp4",
      size: "45.8 MB",
      uploadedBy: "Dr. Sarah Chen",
      uploadedAt: "2024-01-11",
      folder: "videos",
      shared: true,
      icon: VideoCameraIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      id: 6,
      name: "Quantum_Computing_Paper.pdf",
      type: "pdf",
      size: "1.9 MB",
      uploadedBy: "Prof. David Kim",
      uploadedAt: "2024-01-10",
      folder: "research-papers",
      shared: false,
      icon: DocumentTextIcon,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
  ];

  // Filter files based on selected folder and search term
  const filteredFiles = files.filter((file) => {
    const matchesFolder =
      selectedFolder === "all" || file.folder === selectedFolder;
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleFileAction = (action, file) => {
    switch (action) {
      case "preview":
        toast.success(`Opening preview for ${file.name}`);
        break;
      case "share":
        toast.success(`Sharing ${file.name}`);
        break;
      case "delete":
        toast.success(`${file.name} moved to trash`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            File Manager
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Organize and manage your research files
          </p>
        </div>
        <ModernButton onClick={() => setShowUploadModal(true)}>
          <div className="flex items-center">
            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
            <span>Upload Files</span>
          </div>
        </ModernButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Folders */}
        <div className="lg:col-span-1">
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Folders
            </h3>
            <div className="space-y-2">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors duration-200 ${
                    selectedFolder === folder.id
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <folder.icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{folder.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {folder.count}
                  </span>
                </button>
              ))}
            </div>
          </ModernCard>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and View Controls */}
          <ModernCard className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === "grid"
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === "list"
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </ModernCard>

          {/* Files Display */}
          <ModernCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedFolder === "all"
                  ? "All Files"
                  : folders.find((f) => f.id === selectedFolder)?.name}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredFiles.length} files
              </span>
            </div>

            {filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No files found
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-3"
                }
              >
                {filteredFiles.map((file) =>
                  viewMode === "grid" ? (
                    // Grid View
                    <div
                      key={file.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center mb-3">
                        <div
                          className={`${file.bgColor} p-2 rounded-lg flex-shrink-0`}
                        >
                          <file.icon className={`h-6 w-6 ${file.color}`} />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {file.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>{file.uploadedBy}</span>
                        <span>{file.uploadedAt}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleFileAction("preview", file)}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleFileAction("share", file)}
                            className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                          >
                            <ShareIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleFileAction("delete", file)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        {file.shared && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                            Shared
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    // List View
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div
                          className={`${file.bgColor} p-2 rounded-lg flex-shrink-0`}
                        >
                          <file.icon className={`h-5 w-5 ${file.color}`} />
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>{file.size}</span>
                            <span>{file.uploadedBy}</span>
                            <span>{file.uploadedAt}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {file.shared && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                            Shared
                          </span>
                        )}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleFileAction("preview", file)}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleFileAction("share", file)}
                            className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                          >
                            <ShareIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleFileAction("delete", file)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </ModernCard>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <FileUpload
          onUpload={(uploadedFiles) => {
            console.log("Files uploaded:", uploadedFiles);
            // Here you would typically update your files state
            toast.success(
              `${uploadedFiles.length} file(s) uploaded successfully!`
            );
          }}
          onClose={() => setShowUploadModal(false)}
          maxFiles={10}
          maxSize={50}
        />
      )}
    </div>
  );
};

export default Files;

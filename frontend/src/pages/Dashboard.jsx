import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  UsersIcon,
  UserIcon,
  FolderIcon,
  ArchiveBoxIcon,
  PhotoIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import ModernCard from "../components/ModernCard";
import ModernButton from "../components/ModernButton";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import dashboardService from "../services/dashboardService";

import SkeletonLoader from "../components/SkeletonLoader";

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [statsResult, activityResult, filesResult] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getRecentActivity(),
          dashboardService.getRecentFiles(),
        ]);

        if (statsResult.success) {
          setStats(statsResult.data);
        } else {
          setError(statsResult.message);
        }

        if (activityResult.success) {
          setRecentActivity(activityResult.data);
        }

        if (filesResult.success) {
          setRecentFiles(filesResult.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Create stats array from real data
  const statsArray = stats
    ? [
        {
          name: "Active Groups",
          value: stats.activeGroups.toString(),
          icon: UserGroupIcon,
          color: "bg-blue-500",
          description: "Research groups you're part of",
        },
        {
          name: "Research Papers",
          value: stats.totalPapers.toString(),
          icon: DocumentTextIcon,
          color: "bg-green-500",
          description: "Papers across all your groups",
        },
        {
          name: "Active Discussions",
          value: stats.totalDiscussions.toString(),
          icon: ClipboardDocumentListIcon,
          color: "bg-purple-500",
          description: "Ongoing research discussions",
        },
        {
          name: "Collaborators",
          value: stats.totalCollaborators.toString(),
          icon: ChatBubbleLeftRightIcon,
          color: "bg-orange-500",
          description: "Total research collaborators",
        },
      ]
    : [];

  // Handle quick action clicks with loading states
  const handleQuickAction = async (actionName, actionFn) => {
    try {
      setActionLoading(actionName);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Small delay for UX
      actionFn();
    } finally {
      setActionLoading(null);
    }
  };

  // Quick Actions with real functionality
  const quickActions = [
    {
      name: "New Paper",
      description: "Upload a research paper to your groups",
      icon: DocumentTextIcon,
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => {
        // Check if user has groups first
        if (stats && stats.activeGroups > 0) {
          navigate("/groups");
          toast.success("Opening groups - select a group to upload papers");
        } else {
          toast.info("Join or create a group first to upload papers");
          navigate("/groups");
        }
      },
    },
    {
      name: "Create Group",
      description: "Form a new research collaboration",
      icon: UsersIcon,
      color: "bg-green-500 hover:bg-green-600",
      action: () => {
        navigate("/groups");
        toast.success("Opening groups page - click 'Create Group' to start");
      },
    },
    {
      name: "Start Discussion",
      description: "Begin a new research discussion",
      icon: ChatBubbleLeftRightIcon,
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => {
        if (stats && stats.activeGroups > 0) {
          navigate("/groups");
          toast.success("Opening groups - select a group to start discussions");
        } else {
          toast.info("Join a group first to start discussions");
          navigate("/groups");
        }
      },
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Welcome back, {user?.firstName}! Here's what's happening with your
          research.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <p className="text-red-600 dark:text-red-400">⚠️ {error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading
          ? // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <ModernCard key={index} className="p-6">
                <SkeletonLoader className="h-20" />
              </ModernCard>
            ))
          : statsArray.map((stat) => (
              <ModernCard
                key={stat.name}
                className="p-6"
                hover={true}
                glare={true}
                glow={true}
              >
                <div className="flex items-start">
                  <div
                    className={`${stat.color} p-3 rounded-xl shadow-lg animate-float flex-shrink-0`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.name}
                    </p>
                    <div className="mb-2">
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </ModernCard>
            ))}
      </div>

      {/* Empty State Message */}
      {!loading && stats && stats.activeGroups === 0 && (
        <div className="text-center py-12 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 border border-blue-200/50 dark:border-blue-700/50">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to Research Hub! 🎉
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get started by creating your first research group to begin
                collaborating.
              </p>
              <ModernButton
                onClick={() => navigate("/groups")}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Your First Group
              </ModernButton>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const isLoading = actionLoading === action.name;
            return (
              <ModernCard
                key={action.name}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  isLoading ? "opacity-75 scale-95" : "hover:scale-105"
                } ${isLoading ? "pointer-events-none" : ""}`}
                hover={!isLoading}
                onClick={() => {
                  if (action.action && !isLoading) {
                    handleQuickAction(action.name, action.action);
                  }
                }}
              >
                <div className="text-center">
                  <div
                    className={`${
                      action.color
                    } p-3 rounded-lg inline-flex mb-3 transition-colors duration-200 ${
                      isLoading ? "animate-pulse" : ""
                    }`}
                  >
                    {isLoading ? (
                      <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <action.icon className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </ModernCard>
            );
          })}
        </div>
      </div>

      {/* Main Content - 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <ModernCard className="p-0">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <ModernButton
              variant="ghost"
              size="sm"
              onClick={() => navigate("/groups")}
            >
              View All
            </ModernButton>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonLoader key={index} className="h-16" />
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  // Map icon names to actual components
                  const IconComponent =
                    activity.icon === "DocumentTextIcon"
                      ? DocumentTextIcon
                      : ChatBubbleLeftRightIcon;

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                    >
                      <div
                        className={`${activity.bgColor} p-2 rounded-lg flex-shrink-0`}
                      >
                        <IconComponent
                          className={`h-4 w-4 ${activity.color}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {dashboardService.formatTimeAgo(activity.time)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No recent activity
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Join groups and upload papers to see activity here
                </p>
              </div>
            )}
          </div>
        </ModernCard>

        {/* Recent Files */}
        <ModernCard className="p-0">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Files
            </h3>
            <ModernButton
              variant="ghost"
              size="sm"
              onClick={() => navigate("/groups")}
            >
              View All
            </ModernButton>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonLoader key={index} className="h-16" />
                ))}
              </div>
            ) : recentFiles.length > 0 ? (
              <div className="space-y-3">
                {recentFiles.slice(0, 3).map((file) => {
                  // Get file icon based on type
                  const getFileIcon = (type) => {
                    switch (type) {
                      case "pdf":
                        return DocumentTextIcon;
                      case "docx":
                      case "doc":
                        return ArchiveBoxIcon;
                      case "jpg":
                      case "png":
                        return PhotoIcon;
                      default:
                        return FolderIcon;
                    }
                  };

                  const getFileColor = (type) => {
                    switch (type) {
                      case "pdf":
                        return {
                          color: "text-red-600",
                          bgColor: "bg-red-100 dark:bg-red-900/20",
                        };
                      case "docx":
                      case "doc":
                        return {
                          color: "text-blue-600",
                          bgColor: "bg-blue-100 dark:bg-blue-900/20",
                        };
                      case "jpg":
                      case "png":
                        return {
                          color: "text-purple-600",
                          bgColor: "bg-purple-100 dark:bg-purple-900/20",
                        };
                      default:
                        return {
                          color: "text-gray-600",
                          bgColor: "bg-gray-100 dark:bg-gray-900/20",
                        };
                    }
                  };

                  const IconComponent = getFileIcon(file.type);
                  const colors = getFileColor(file.type);

                  return (
                    <div
                      key={file.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                    >
                      <div
                        className={`${colors.bgColor} p-2 rounded-lg flex-shrink-0`}
                      >
                        <IconComponent className={`h-4 w-4 ${colors.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>{file.size}</span>
                          <span>
                            {dashboardService.formatTimeAgo(file.uploadedAt)}
                          </span>
                        </div>
                        {file.groupName && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            from {file.groupName}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No recent files
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Upload papers to see them here
                </p>
              </div>
            )}
          </div>
        </ModernCard>

        {/* User Profile Summary */}
        <ModernCard className="p-0">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Profile Summary
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-start space-x-4">
              {/* User Avatar */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full flex-shrink-0">
                <UserIcon className="h-8 w-8 text-white" />
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {user?.institution || "Research Hub Member"}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats?.activeGroups || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Groups
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats?.totalPapers || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Papers
                    </p>
                  </div>
                </div>

                {/* Profile Action */}
                <div className="mt-4">
                  <ModernButton
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/profile")}
                    className="w-full"
                  >
                    View Profile
                  </ModernButton>
                </div>
              </div>
            </div>
          </div>
        </ModernCard>
      </div>
    </div>
  );
};

export default Dashboard;

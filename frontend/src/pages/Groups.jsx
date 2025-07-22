import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  UsersIcon,
  DocumentTextIcon,
  CalendarIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  XMarkIcon,
  FunnelIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import ModernCard from "../components/ModernCard";
import ModernButton from "../components/ModernButton";
import groupService from "../services/groupService";
import { useAuth } from "../contexts/AuthContext";
import GroupSettingsModal from "../components/groups/GroupSettingsModal";
import MemberManagementModal from "../components/groups/MemberManagementModal";

const Groups = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // UI State
  const [activeTab, setActiveTab] = useState("my-groups");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedField, setSelectedField] = useState("all");
  const [sortBy, setSortBy] = useState("activity");

  // Data State
  const [myGroups, setMyGroups] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Create Group Form State
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    fieldOfStudy: "",
    isPublic: true,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Data fetching functions
  const fetchMyGroups = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await groupService.getMyGroups();
      if (result.success) {
        setMyGroups(result.groups);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Failed to load your groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicGroups = async (options = {}) => {
    setLoading(true);
    setError("");

    try {
      const result = await groupService.getPublicGroups({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        fieldOfStudy: selectedField === "all" ? "" : selectedField,
        ...options,
      });

      if (result.success) {
        setPublicGroups(result.groups);
        setPagination(result.pagination);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Failed to load public groups");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and tab change
  useEffect(() => {
    if (activeTab === "my-groups") {
      fetchMyGroups();
    } else {
      fetchPublicGroups();
    }
  }, [activeTab]);

  // Search and filter effects
  useEffect(() => {
    if (activeTab === "discover") {
      const timeoutId = setTimeout(() => {
        fetchPublicGroups({ page: 1 });
      }, 500); // Debounce search

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, selectedField]);

  // Research fields for filtering
  const researchFields = [
    { id: "all", name: "All Fields", count: publicGroups.length },
    { id: "ai", name: "Artificial Intelligence", count: 2 },
    { id: "quantum", name: "Quantum Computing", count: 1 },
    { id: "climate", name: "Climate Science", count: 1 },
    { id: "biomedical", name: "Biomedical", count: 1 },
    { id: "psychology", name: "Psychology", count: 1 },
  ];

  // Mock data removed - now using real backend data

  // Create group functionality
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");

    try {
      const result = await groupService.createGroup(createForm);

      if (result.success) {
        // Reset form
        setCreateForm({
          name: "",
          description: "",
          fieldOfStudy: "",
          isPublic: true,
        });

        // Close modal
        setShowCreateModal(false);

        // Refresh data
        fetchMyGroups();
        if (activeTab === "discover") {
          fetchPublicGroups();
        }

        // Show success message (you can add a toast notification here)
        console.log("Group created successfully:", result.group.name);
      } else {
        setCreateError(result.message);
      }
    } catch (error) {
      setCreateError("Failed to create group");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    setActionLoading((prev) => ({ ...prev, [groupId]: true }));
    setError("");

    try {
      const result = await groupService.joinGroup(groupId);

      if (result.success) {
        // Refresh data
        fetchMyGroups();
        fetchPublicGroups();
        console.log("Joined group successfully");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Failed to join group");
    } finally {
      setActionLoading((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  const handleLeaveGroup = async (groupId) => {
    setActionLoading((prev) => ({ ...prev, [groupId]: true }));
    setError("");

    try {
      const result = await groupService.leaveGroup(groupId);

      if (result.success) {
        // Refresh data
        fetchMyGroups();
        fetchPublicGroups();
        console.log("Left group successfully");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Failed to leave group");
    } finally {
      setActionLoading((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  const confirmLeaveGroup = (groupId, groupName) => {
    setConfirmAction({
      type: "leave",
      groupId,
      groupName,
      title: "Leave Group",
      message: `Are you sure you want to leave "${groupName}"? You'll need to request access again to rejoin.`,
      confirmText: "Leave Group",
      onConfirm: () => handleLeaveGroup(groupId),
    });
    setShowConfirmDialog(true);
  };

  const tabs = [
    { id: "my-groups", name: "My Groups", count: myGroups.length },
    { id: "discover", name: "Discover", count: publicGroups.length },
  ];

  // Helper functions

  const openSettings = (group) => {
    setSelectedGroup(group);
    setShowSettingsModal(true);
  };

  const openMembers = (group) => {
    setSelectedGroup(group);
    setShowMembersModal(true);
  };

  const handleGroupUpdated = (updatedGroup) => {
    // Update the group in both myGroups and publicGroups arrays
    setMyGroups((prev) =>
      prev.map((group) =>
        group._id === updatedGroup._id ? updatedGroup : group
      )
    );
    setPublicGroups((prev) =>
      prev.map((group) =>
        group._id === updatedGroup._id ? updatedGroup : group
      )
    );

    // Update selected group if it's the same one
    if (selectedGroup && selectedGroup._id === updatedGroup._id) {
      setSelectedGroup(updatedGroup);
    }
  };

  const handleMemberRemoved = (memberId) => {
    // Update member count in the selected group
    if (selectedGroup) {
      const updatedGroup = {
        ...selectedGroup,
        memberCount: (selectedGroup.memberCount || 0) - 1,
        members:
          selectedGroup.members?.filter((m) => m.user._id !== memberId) || [],
      };
      setSelectedGroup(updatedGroup);

      // Also update in the main arrays
      setMyGroups((prev) =>
        prev.map((group) =>
          group._id === selectedGroup._id
            ? { ...group, memberCount: (group.memberCount || 0) - 1 }
            : group
        )
      );
    }
  };

  const getActivityColor = (level) => {
    switch (level) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getFieldColor = (field) => {
    switch (field) {
      case "ai":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "quantum":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "climate":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "biomedical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "psychology":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const GroupCard = ({ group, showJoinButton = false }) => {
    // Helper function to get activity level (moved up to avoid hoisting issues)
    const getActivityLevel = (group) => {
      const memberCount = group.memberCount || group.members?.length || 0;
      const daysSinceCreated = Math.ceil(
        (new Date() - new Date(group.createdAt)) / (1000 * 60 * 60 * 24)
      );

      if (memberCount > 10 && daysSinceCreated < 30)
        return { level: "high", label: "Very Active", color: "green" };
      if (memberCount > 5 && daysSinceCreated < 90)
        return { level: "medium", label: "Active", color: "blue" };
      return { level: "low", label: "Growing", color: "yellow" };
    };

    const activity = getActivityLevel(group);
    const memberCount = group.memberCount || group.members?.length || 0;

    // Helper function to get fun group colors based on field
    const getGroupColor = (fieldOfStudy) => {
      const colors = {
        "Computer Science": "bg-gradient-to-br from-blue-400 to-cyan-500",
        Physics: "bg-gradient-to-br from-purple-400 to-pink-500",
        Biology: "bg-gradient-to-br from-green-400 to-emerald-500",
        Chemistry: "bg-gradient-to-br from-red-400 to-rose-500",
        Mathematics: "bg-gradient-to-br from-indigo-400 to-blue-500",
        Engineering: "bg-gradient-to-br from-orange-400 to-amber-500",
        Medicine: "bg-gradient-to-br from-pink-400 to-purple-500",
        Psychology: "bg-gradient-to-br from-yellow-400 to-orange-500",
      };
      return (
        colors[fieldOfStudy] || "bg-gradient-to-br from-gray-400 to-gray-500"
      );
    };

    // Helper function to format date
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return `${Math.ceil(diffDays / 30)} months ago`;
    };

    // Helper function to get founded text
    const getFoundedText = (dateString) => {
      const date = new Date(dateString);
      const monthYear = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      return `Founded ${monthYear}`;
    };

    // Helper function to get member avatars
    const getMemberAvatars = (group) => {
      if (!group.members || !Array.isArray(group.members)) return [];

      return group.members.map((member) => {
        // If member has populated user data with avatar
        if (
          member.user &&
          typeof member.user === "object" &&
          member.user.avatar
        ) {
          return member.user.avatar;
        }
        // Fallback to default avatar
        return `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80`;
      });
    };

    return (
      <div className="group relative overflow-hidden">
        {/* Fun Background with Floating Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-gray-800/50 dark:via-gray-800/30 dark:to-gray-800/50 rounded-3xl"></div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full translate-y-8 -translate-x-8"></div>

        {/* Main Card */}
        <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
          {/* Header with Fun Icon and Title */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-start space-x-4 flex-1 min-w-0">
              {/* Dynamic Colorful Icon with Hover Animation */}
              <div
                className={`${getGroupColor(
                  group.fieldOfStudy
                )} p-3 rounded-lg shadow-sm flex-shrink-0`}
              >
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {group.name}
                  </h3>

                  {group.owner?._id === user?._id && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex-shrink-0">
                      Owner
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 leading-relaxed">
                  {group.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sleek Stats Cards */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {/* Members Card - Compact */}
            <div className="bg-gradient-to-br from-blue-100/80 to-cyan-100/80 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg p-2 border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center space-x-1.5">
                <div className="bg-blue-500 p-0.5 rounded flex-shrink-0">
                  <UsersIcon className="h-2.5 w-2.5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-blue-900 dark:text-blue-100 leading-none">
                    {memberCount}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-300 font-medium leading-none mt-0.5">
                    {memberCount === 1 ? "Member" : "Members"}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Card - Compact */}
            <div
              className={`rounded-lg p-2 border ${
                activity.color === "green"
                  ? "bg-gradient-to-br from-emerald-100/80 to-green-100/80 dark:from-emerald-900/30 dark:to-green-900/30 border-emerald-200/50 dark:border-emerald-700/50"
                  : activity.color === "blue"
                  ? "bg-gradient-to-br from-blue-100/80 to-indigo-100/80 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200/50 dark:border-blue-700/50"
                  : "bg-gradient-to-br from-amber-100/80 to-yellow-100/80 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-200/50 dark:border-amber-700/50"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <div
                  className={`p-0.5 rounded flex-shrink-0 ${
                    activity.color === "green"
                      ? "bg-emerald-500"
                      : activity.color === "blue"
                      ? "bg-blue-500"
                      : "bg-amber-500"
                  }`}
                >
                  <span className="text-white text-xs">
                    {activity.level === "high"
                      ? "🔥"
                      : activity.level === "medium"
                      ? "⚡"
                      : "🌱"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-bold leading-none ${
                      activity.color === "green"
                        ? "text-emerald-900 dark:text-emerald-100"
                        : activity.color === "blue"
                        ? "text-blue-900 dark:text-blue-100"
                        : "text-amber-900 dark:text-amber-100"
                    }`}
                  >
                    {activity.label}
                  </div>
                  <div
                    className={`text-xs font-medium leading-none mt-0.5 ${
                      activity.color === "green"
                        ? "text-emerald-600 dark:text-emerald-300"
                        : activity.color === "blue"
                        ? "text-blue-600 dark:text-blue-300"
                        : "text-amber-600 dark:text-amber-300"
                    }`}
                  >
                    Activity
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Spacious Secondary Info Section */}
          <div className="space-y-4 mb-5">
            {/* Sleek Compact Info Cards */}
            <div className="grid grid-cols-2 gap-2">
              {/* Founded Date Card - Ultra Compact */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-2 border border-indigo-100 dark:border-indigo-800/50">
                <div className="flex items-center space-x-1.5">
                  <div className="bg-indigo-500 p-0.5 rounded flex-shrink-0">
                    <CalendarIcon className="h-2.5 w-2.5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 leading-none">
                      Founded
                    </div>
                    <div className="text-sm font-bold text-indigo-900 dark:text-indigo-100 leading-none mt-0.5">
                      {new Date(group.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Card - Ultra Compact */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg p-2 border border-emerald-100 dark:border-emerald-800/50">
                <div className="flex items-center space-x-1.5">
                  <div className="bg-emerald-500 p-0.5 rounded flex-shrink-0">
                    <ClockIcon className="h-2.5 w-2.5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 leading-none">
                      Last Active
                    </div>
                    <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100 leading-none mt-0.5">
                      {formatDate(group.updatedAt || group.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Refined Field Badge */}
            {group.fieldOfStudy && (
              <div className="flex justify-center">
                <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  <span>{group.fieldOfStudy}</span>
                </div>
              </div>
            )}
          </div>

          {/* Fun Member Avatars Section */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              {/* Colorful Avatar Stack */}
              <div className="flex -space-x-2">
                {getMemberAvatars(group)
                  .slice(0, 4)
                  .map((avatar, index) => (
                    <div key={index} className="relative">
                      <img
                        src={avatar}
                        alt={`Member ${index + 1}`}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                  ))}
                {memberCount > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      +{memberCount - 4}
                    </span>
                  </div>
                )}
              </div>

              {/* Fun Member Text */}
              {memberCount > 0 && (
                <div className="text-xs">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {memberCount}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    researcher{memberCount !== 1 ? "s" : ""} 🧑‍🔬
                  </span>
                </div>
              )}
            </div>

            {/* Privacy Badge */}
            {!group.isPublic && (
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                🔒 Private
              </div>
            )}
          </div>

          {/* Fun Action Buttons */}
          <div className="flex items-center space-x-2">
            {showJoinButton ? (
              <button
                onClick={() => handleJoinGroup(group._id)}
                disabled={actionLoading[group._id]}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading[group._id] ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Joining...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>
                      {group.isPublic ? "🚀 Join Group" : "📝 Request Access"}
                    </span>
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={() => navigate(`/groups/${group._id}`)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>🔍 Explore Group</span>
                </div>
              </button>
            )}

            {/* Owner actions */}
            {group.role === "owner" && (
              <div className="flex space-x-1">
                <button
                  onClick={() => openMembers(group)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg transition-colors"
                  title="Manage Members"
                >
                  <UsersIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openSettings(group)}
                  className="bg-gray-600 hover:bg-gray-700 text-white p-2.5 rounded-lg transition-colors"
                  title="Group Settings"
                >
                  <CogIcon className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Member actions */}
            {group.role === "member" && (
              <button
                onClick={() => confirmLeaveGroup(group._id, group.name)}
                disabled={actionLoading[group._id]}
                className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Leave Group"
              >
                {actionLoading[group._id] ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <XMarkIcon className="h-4 w-4" />
                )}
              </button>
            )}

            <button
              onClick={() => navigate(`/groups/${group._id}`)}
              className="bg-amber-600 hover:bg-amber-700 text-white p-2.5 rounded-lg transition-colors"
              title="View Group"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Fun Header */}
      <div className="relative mb-8">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl -z-10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>

        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 rounded-3xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                🧑‍🔬 Research Groups
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Connect, collaborate, and create amazing research together! ✨
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <PlusIcon className="h-5 w-5" />
              <span>🚀 Create Group</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex-1 max-w-lg relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <ModernButton
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <div className="flex items-center">
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  <span>Filters</span>
                  <ChevronDownIcon
                    className={`h-5 w-5 ml-2 transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </ModernButton>

              {showFilters && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Research Field
                      </label>
                      <select
                        value={selectedField}
                        onChange={(e) => setSelectedField(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {researchFields.map((field) => (
                          <option key={field.id} value={field.id}>
                            {field.name} ({field.count})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="activity">Recent Activity</option>
                        <option value="members">Member Count</option>
                        <option value="papers">Paper Count</option>
                        <option value="name">Name (A-Z)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "my-groups"
              ? myGroups.map((group) => (
                  <GroupCard key={group._id} group={group} />
                ))
              : publicGroups.map((group) => (
                  <GroupCard
                    key={group._id}
                    group={group}
                    showJoinButton={true}
                  />
                ))}
          </div>

          {/* Empty State */}
          {!loading && (
            <>
              {activeTab === "my-groups" && myGroups.length === 0 && (
                <div className="text-center py-12">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No groups yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by creating your first research group.
                  </p>
                  <div className="mt-6">
                    <ModernButton onClick={() => setShowCreateModal(true)}>
                      <div className="flex items-center">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        <span>Create Group</span>
                      </div>
                    </ModernButton>
                  </div>
                </div>
              )}

              {activeTab === "discover" && publicGroups.length === 0 && (
                <div className="text-center py-12">
                  <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No groups found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filters.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowCreateModal(false)}
            />

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Create New Group
                </h3>

                {createError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {createError}
                    </p>
                  </div>
                )}

                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter group name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe your research group"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Field of Study
                    </label>
                    <select
                      value={createForm.fieldOfStudy}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          fieldOfStudy: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a field of study</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Biology">Biology</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Psychology">Psychology</option>
                      <option value="Medicine">Medicine</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Economics">Economics</option>
                      <option value="Political Science">
                        Political Science
                      </option>
                      <option value="Sociology">Sociology</option>
                      <option value="History">History</option>
                      <option value="Literature">Literature</option>
                      <option value="Philosophy">Philosophy</option>
                      <option value="Environmental Science">
                        Environmental Science
                      </option>
                      <option value="Neuroscience">Neuroscience</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Artificial Intelligence">
                        Artificial Intelligence
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Privacy
                    </label>
                    <select
                      value={createForm.isPublic}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          isPublic: e.target.value === "true",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="true">Public - Anyone can join</option>
                      <option value="false">Private - Invitation only</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <ModernButton
                  type="submit"
                  onClick={handleCreateGroup}
                  disabled={createLoading}
                  className="sm:ml-3"
                >
                  {createLoading ? "Creating..." : "Create Group"}
                </ModernButton>
                <ModernButton
                  variant="secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError("");
                    setCreateForm({
                      name: "",
                      description: "",
                      fieldOfStudy: "",
                      isPublic: true,
                    });
                  }}
                  className="mt-3 sm:mt-0"
                >
                  Cancel
                </ModernButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Settings Modal */}
      <GroupSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        group={selectedGroup}
        onGroupUpdated={handleGroupUpdated}
      />

      {/* Member Management Modal */}
      <MemberManagementModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        group={selectedGroup}
        onMemberRemoved={handleMemberRemoved}
      />

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {confirmAction.title}
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {confirmAction.message}
            </p>

            <div className="flex justify-end space-x-3">
              <ModernButton
                variant="ghost"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmAction(null);
                }}
              >
                Cancel
              </ModernButton>
              <ModernButton
                variant="secondary"
                onClick={() => {
                  confirmAction.onConfirm();
                  setShowConfirmDialog(false);
                  setConfirmAction(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
              >
                {confirmAction.confirmText}
              </ModernButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ModernCard from "../components/ModernCard";
import ModernButton from "../components/ModernButton";
import LoadingSpinner from "../components/LoadingSpinner";
import GroupDiscussions from "../components/GroupDiscussions";
import GroupPapers from "../components/GroupPapers";
import groupService from "../services/groupService";
import {
  UserGroupIcon,
  UsersIcon,
  ClockIcon,
  CogIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  UserMinusIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Helper function to get group colors based on field
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

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    fieldOfStudy: "",
    isPublic: true,
  });

  // Fetch group details
  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const result = await groupService.getGroup(id);

      if (result.success) {
        setGroup(result.group);
        // Initialize edit form with current group data
        setEditForm({
          name: result.group.name,
          description: result.group.description,
          fieldOfStudy: result.group.fieldOfStudy || "",
          isPublic: result.group.isPublic,
        });
      } else {
        setError(result.message || "Failed to fetch group details");
      }
    } catch (err) {
      setError("Failed to fetch group details");
      console.error("Error fetching group:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle leave group
  const handleLeaveGroup = async () => {
    try {
      const result = await groupService.leaveGroup(id);

      if (result.success) {
        navigate("/groups");
      } else {
        setError(result.message || "Failed to leave group");
      }
    } catch (err) {
      setError("Failed to leave group");
      console.error("Error leaving group:", err);
    }
  };

  // Handle remove member
  const handleRemoveMember = async (memberId) => {
    try {
      const result = await groupService.removeMember(id, memberId);

      if (result.success) {
        // Refresh group data
        fetchGroupDetails();
      } else {
        setError(result.message || "Failed to remove member");
      }
    } catch (err) {
      setError("Failed to remove member");
      console.error("Error removing member:", err);
    }
  };

  // Handle send invitation
  const handleSendInvitation = async (e) => {
    e.preventDefault();

    if (!inviteEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    setInviteLoading(true);
    setError("");

    try {
      // Call the real API
      const result = await groupService.sendInvitation(id, {
        email: inviteEmail.trim(),
        message: inviteMessage.trim(),
      });

      if (result.success) {
        // Reset form and close modal
        setInviteEmail("");
        setInviteMessage("");
        setShowInviteModal(false);

        // Show success message
        alert(
          `🎉 Invitation sent to ${inviteEmail}!\n\nThey will receive an email with instructions to join the group.`
        );
      } else {
        setError(result.message || "Failed to send invitation");
      }
    } catch (err) {
      setError("Failed to send invitation");
      console.error("Error sending invitation:", err);
    } finally {
      setInviteLoading(false);
    }
  };

  // Handle delete group
  const handleDeleteGroup = async () => {
    try {
      const result = await groupService.deleteGroup(id);

      if (result.success) {
        navigate("/groups");
      } else {
        setError(result.message || "Failed to delete group");
      }
    } catch (err) {
      setError("Failed to delete group");
      console.error("Error deleting group:", err);
    }
  };

  // Handle edit group
  const handleEditGroup = async (e) => {
    e.preventDefault();
    try {
      const result = await groupService.updateGroup(id, editForm);

      if (result.success) {
        setGroup(result.group);
        setShowEditForm(false);
        setShowSettings(false);
      } else {
        setError(result.message || "Failed to update group");
      }
    } catch (err) {
      setError("Failed to update group");
      console.error("Error updating group:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ModernCard className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error Loading Group
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <ModernButton onClick={() => navigate("/groups")}>
            Back to Groups
          </ModernButton>
        </ModernCard>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ModernCard className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Group Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The group you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <ModernButton onClick={() => navigate("/groups")}>
            Back to Groups
          </ModernButton>
        </ModernCard>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      {/* Fun Header */}
      <div className="relative mb-8">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl -z-10"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full translate-y-10 -translate-x-10"></div>

        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/groups")}
              className="flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-4 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>🏠 Back to Groups</span>
            </button>

            {group.userRole === "owner" && (
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2.5 px-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span>⚙️ Settings</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Amazing Group Header */}
      <div className="relative mb-8">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl -z-10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-200/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-green-200/20 to-transparent rounded-full translate-y-14 -translate-x-14"></div>

        <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 rounded-3xl p-8 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              {/* Fun Group Icon */}
              <div className="relative">
                <div
                  className={`${getGroupColor(
                    group.fieldOfStudy
                  )} p-6 rounded-3xl shadow-2xl transform hover:scale-110 transition-all duration-300`}
                >
                  <UserGroupIcon className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white dark:border-gray-900 animate-pulse"></div>
              </div>

              <div className="flex-1">
                {/* Group Name & Role */}
                <div className="flex items-center space-x-4 mb-3">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {group.name}
                  </h1>
                  {group.userRole === "owner" && (
                    <div className="inline-flex items-center px-3 py-1.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-200/50 dark:border-emerald-700/50 shadow-sm">
                      👑 Owner
                    </div>
                  )}
                  {group.userRole === "member" && (
                    <div className="inline-flex items-center px-3 py-1.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-200/50 dark:border-blue-700/50 shadow-sm">
                      🧑‍🔬 Member
                    </div>
                  )}
                  {!group.isPublic && (
                    <div className="inline-flex items-center px-3 py-1.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 shadow-sm">
                      🔒 Private
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {group.description}
                </p>

                {/* Fun Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Members Stat */}
                  <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-3 border border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-500 p-1 rounded-lg">
                        <UsersIcon className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-blue-900 dark:text-blue-100">
                          {group.memberCount}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-300 font-medium">
                          Researchers
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-3 border border-purple-200/50 dark:border-purple-700/50">
                    <div className="flex items-center space-x-2">
                      <div className="bg-purple-500 p-1 rounded-lg">
                        <ClockIcon className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-purple-900 dark:text-purple-100">
                          {formatDate(group.createdAt)}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-300 font-medium">
                          Founded
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Field Badge */}
                  {group.fieldOfStudy && (
                    <div className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl p-3 border border-emerald-200/50 dark:border-emerald-700/50">
                      <div className="flex items-center space-x-2">
                        <div className="bg-emerald-500 p-1 rounded-lg">
                          <span className="text-white text-xs">📚</span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                            {group.fieldOfStudy}
                          </div>
                          <div className="text-xs text-emerald-600 dark:text-emerald-300 font-medium">
                            Field
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Invite Members Button - Available to all members */}
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <UserPlusIcon className="h-4 w-4" />
                  <span>Invite Members</span>
                </div>
              </button>

              {/* Leave Group Button - Only for members */}
              {group.userRole === "member" && (
                <button
                  onClick={handleLeaveGroup}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <UserMinusIcon className="h-4 w-4" />
                    <span>Leave Group</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fun Navigation Tabs */}
      <div className="mb-8">
        <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-2xl">
          {[
            {
              id: "overview",
              name: "Overview",
              icon: UserGroupIcon,
              emoji: "📊",
            },
            { id: "members", name: "Members", icon: UsersIcon, emoji: "👥" },
            {
              id: "discussions",
              name: "Discussions",
              icon: ChatBubbleLeftRightIcon,
              emoji: "💬",
            },
            {
              id: "papers",
              name: "Papers",
              icon: DocumentTextIcon,
              emoji: "📄",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
              } flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105`}
            >
              <span className="text-base">{tab.emoji}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fun Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Amazing Group Stats */}
          <div className="lg:col-span-2">
            <div className="relative">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl -z-10"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-yellow-200/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>

              <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                    <span className="text-white text-lg">📊</span>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Group Statistics
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Members Stat */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50 transform hover:scale-105 transition-all duration-300">
                      <div className="text-center">
                        <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                          <UsersIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                          {group.memberCount}
                        </div>
                        <div className="text-xs font-medium text-blue-600 dark:text-blue-300">
                          Researchers
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Papers Stat */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50 transform hover:scale-105 transition-all duration-300">
                      <div className="text-center">
                        <div className="bg-purple-500 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                          <DocumentTextIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                          0
                        </div>
                        <div className="text-xs font-medium text-purple-600 dark:text-purple-300">
                          Research Papers
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Amazing Group Owner */}
          <div>
            <div className="relative">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl -z-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-200/20 to-transparent rounded-full translate-y-8 -translate-x-8"></div>

              <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-2 rounded-lg">
                    <span className="text-white text-lg">👑</span>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    Group Owner
                  </h3>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-700/50 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80`}
                          alt={`${group.owner.firstName} ${group.owner.lastName}`}
                          className="w-12 h-12 rounded-full border-3 border-white dark:border-gray-800 shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                      </div>
                      <div>
                        <div className="font-bold text-base text-emerald-900 dark:text-emerald-100">
                          {group.owner.firstName} {group.owner.lastName}
                        </div>
                        <div className="text-sm font-medium text-emerald-600 dark:text-emerald-300">
                          {group.owner.institution}
                        </div>
                        <div className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">
                          Research Leader
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Amazing Members Tab */}
      {activeTab === "members" && (
        <div className="relative">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl -z-10"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-cyan-200/20 to-transparent rounded-full translate-y-10 -translate-x-10"></div>

          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 rounded-3xl p-8 shadow-xl">
            {/* Fun Header */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-2xl">
                <UsersIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Research Team
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  👥 {group.memberCount} brilliant researchers collaborating
                  together
                </p>
              </div>
            </div>

            {/* Amazing Member Cards */}
            <div className="grid gap-4">
              {group.members.map((member, index) => (
                <div
                  key={member._id}
                  className="relative group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-cyan-200/50 dark:border-cyan-700/50 transform hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Enhanced Profile Picture */}
                        <div className="relative">
                          <img
                            src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80`}
                            alt={`${member.user.firstName} ${member.user.lastName}`}
                            className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                          {group.owner._id === member.user._id && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">👑</span>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Member Info */}
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <h4 className="text-xl font-bold text-cyan-900 dark:text-cyan-100">
                              {member.user.firstName} {member.user.lastName}
                            </h4>
                            {group.owner._id === member.user._id && (
                              <div className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/50">
                                👑 Team Leader
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-medium text-cyan-600 dark:text-cyan-300 mb-1">
                            🏛️ {member.user.institution}
                          </div>
                          <div className="text-xs text-cyan-500 dark:text-cyan-400">
                            🎉 Joined {formatDate(member.joinedAt)} • 🧑‍🔬 Active
                            Researcher
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Remove Button */}
                      {group.userRole === "owner" &&
                        group.owner._id !== member.user._id && (
                          <button
                            onClick={() => handleRemoveMember(member.user._id)}
                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                          >
                            <div className="flex items-center space-x-2">
                              <UserMinusIcon className="h-4 w-4" />
                              <span>Remove</span>
                            </div>
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Discussions Tab */}
      {activeTab === "discussions" && (
        <div className="relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl -z-10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-200/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
            <GroupDiscussions groupId={id} group={group} />
          </div>
        </div>
      )}

      {/* Papers Tab */}
      {activeTab === "papers" && (
        <div className="relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl -z-10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-200/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative p-8">
            <GroupPapers groupId={id} group={group} />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Group Settings
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Group Information
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Update your group's basic information and settings.
                </p>
                <ModernButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowEditForm(true)}
                >
                  Edit Group
                </ModernButton>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                  Danger Zone
                </h4>
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  Once you delete a group, there is no going back. Please be
                  certain.
                </p>
                <ModernButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                >
                  <div className="flex items-center">
                    <TrashIcon className="h-4 w-4 mr-2" />
                    <span>Delete Group</span>
                  </div>
                </ModernButton>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <ModernButton
                variant="ghost"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </ModernButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Group
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{group.name}"? This action cannot
              be undone and all group data will be permanently lost.
            </p>

            <div className="flex justify-end space-x-3">
              <ModernButton
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </ModernButton>
              <ModernButton
                onClick={handleDeleteGroup}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Group
              </ModernButton>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Group
            </h3>

            <form onSubmit={handleEditGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field of Study
                </label>
                <select
                  value={editForm.fieldOfStudy}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fieldOfStudy: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a field</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Physics">Physics</option>
                  <option value="Biology">Biology</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Psychology">Psychology</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={editForm.isPublic}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isPublic: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPublic"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Public group (anyone can discover and join)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <ModernButton
                  type="button"
                  variant="ghost"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </ModernButton>
                <ModernButton type="submit">Save Changes</ModernButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Members Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="relative">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl -z-10"></div>

            <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 rounded-3xl max-w-md w-full p-8 shadow-xl">
              {/* Fun Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-3 rounded-2xl">
                  <UserPlusIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    Invite Members
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    ✉️ Grow your research team!
                  </p>
                </div>
              </div>

              {/* Invitation Form */}
              <form onSubmit={handleSendInvitation} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">
                    📧 Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@university.edu"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">
                    💬 Personal Message (Optional)
                  </label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Hey! I'd love for you to join our research group..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      ⚠️ {error}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail("");
                      setInviteMessage("");
                      setError("");
                    }}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium py-2 px-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    disabled={inviteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium py-2 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {inviteLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>✉️</span>
                        <span>Send Invitation</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;

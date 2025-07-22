import React, { useState, useEffect } from "react";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  UserMinusIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  EnvelopeIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/24/solid";
import Modal from "../ui/Modal";
import ModernButton from "../ModernButton";
import groupService from "../../services/groupService";

const MemberManagementModal = ({ isOpen, onClose, group, onMemberRemoved }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  // Fetch group members when modal opens
  useEffect(() => {
    if (isOpen && group) {
      fetchMembers();
    }
  }, [isOpen, group]);

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setError("");
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      // For now, use the members from the group object
      // In a real app, you might want to fetch detailed member info
      if (group.members) {
        setMembers(group.members);
      }
    } catch (err) {
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setRemoving(true);
    setError("");

    try {
      const result = await groupService.removeMember(group._id, memberId);

      if (result.success) {
        // Remove member from local state
        setMembers((prev) =>
          prev.filter((member) => member.user._id !== memberId)
        );
        setShowRemoveConfirm(false);
        setMemberToRemove(null);

        // Notify parent component
        if (onMemberRemoved) {
          onMemberRemoved(memberId);
        }
      } else {
        setError(result.message || "Failed to remove member");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setRemoving(false);
    }
  };

  const confirmRemoveMember = (member) => {
    setMemberToRemove(member);
    setShowRemoveConfirm(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter members based on search term
  const filteredMembers = members.filter(
    (member) =>
      member.user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Manage Members - ${group?.name}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                transition-colors
              "
            />
          </div>

          {/* Members List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? "No members found matching your search"
                    : "No members found"}
                </p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.user._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>

                    {/* Member Info */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {member.user.firstName} {member.user.lastName}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <div className="flex items-center">
                          <EnvelopeIcon className="w-4 h-4 mr-1" />
                          <span>{member.user.email}</span>
                        </div>
                        {member.user.institution && (
                          <div className="flex items-center">
                            <AcademicCapIcon className="w-4 h-4 mr-1" />
                            <span>{member.user.institution}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        <span>Joined {formatDate(member.joinedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {/* Only show remove button if not the owner */}
                    {member.user._id !== group?.owner?._id && (
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmRemoveMember(member)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <div className="flex items-center space-x-1">
                          <UserMinusIcon className="h-4 w-4" />
                          <span className="text-xs">Remove</span>
                        </div>
                      </ModernButton>
                    )}
                    {member.user._id === group?.owner?._id && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                        Owner
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredMembers.length} member
              {filteredMembers.length !== 1 ? "s" : ""}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
            <ModernButton variant="ghost" onClick={onClose}>
              Close
            </ModernButton>
          </div>
        </div>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      {showRemoveConfirm && memberToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Remove Member
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to remove{" "}
              <span className="font-medium">
                {memberToRemove.user.firstName} {memberToRemove.user.lastName}
              </span>{" "}
              from this group? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <ModernButton
                variant="ghost"
                onClick={() => {
                  setShowRemoveConfirm(false);
                  setMemberToRemove(null);
                }}
                disabled={removing}
              >
                Cancel
              </ModernButton>
              <ModernButton
                variant="secondary"
                onClick={() => handleRemoveMember(memberToRemove.user._id)}
                loading={removing}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
              >
                Remove Member
              </ModernButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MemberManagementModal;

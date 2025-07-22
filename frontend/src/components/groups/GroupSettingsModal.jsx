import React, { useState, useEffect } from "react";
import { CheckIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Modal from "../ui/Modal";
import ModernButton from "../ModernButton";
import groupService from "../../services/groupService";

const GroupSettingsModal = ({ isOpen, onClose, group, onGroupUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fieldOfStudy: "",
    isPublic: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Initialize form data when group changes
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || "",
        description: group.description || "",
        fieldOfStudy: group.fieldOfStudy || "",
        isPublic: group.isPublic ?? true,
      });
    }
  }, [group]);

  // Clear messages when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setSuccessMessage("");
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Group name must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const result = await groupService.updateGroup(group._id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        fieldOfStudy: formData.fieldOfStudy.trim(),
        isPublic: formData.isPublic,
      });

      if (result.success) {
        setSuccessMessage("Group updated successfully!");
        onGroupUpdated(result.group);

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrors({ general: result.message || "Failed to update group" });
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Group Settings"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm font-medium">
              {successMessage}
            </p>
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-200 text-sm">
              {errors.general}
            </p>
          </div>
        )}

        {/* Group Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Group Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`
              w-full px-4 py-3 rounded-lg border transition-colors
              ${
                errors.name
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
              }
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:ring-2 focus:ring-opacity-50
            `}
            placeholder="Enter group name"
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={`
              w-full px-4 py-3 rounded-lg border transition-colors resize-none
              ${
                errors.description
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
              }
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:ring-2 focus:ring-opacity-50
            `}
            placeholder="Describe your group's purpose and goals"
            disabled={loading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.description}
            </p>
          )}
        </div>

        {/* Field of Study */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Field of Study
          </label>
          <select
            name="fieldOfStudy"
            value={formData.fieldOfStudy}
            onChange={handleInputChange}
            className="
              w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              transition-colors
            "
            disabled={loading}
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
            <option value="Political Science">Political Science</option>
            <option value="Sociology">Sociology</option>
            <option value="History">History</option>
            <option value="Literature">Literature</option>
            <option value="Philosophy">Philosophy</option>
            <option value="Environmental Science">Environmental Science</option>
            <option value="Neuroscience">Neuroscience</option>
            <option value="Data Science">Data Science</option>
            <option value="Artificial Intelligence">
              Artificial Intelligence
            </option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Privacy Setting */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              disabled={loading}
              className="
                w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded
                focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800
                focus:ring-2 dark:bg-gray-700 dark:border-gray-600
              "
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Make this group public
            </span>
          </label>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Public groups can be discovered and joined by anyone. Private groups
            require an invitation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <ModernButton
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </ModernButton>
          <ModernButton type="submit" loading={loading} icon={CheckIcon}>
            Save Changes
          </ModernButton>
        </div>
      </form>
    </Modal>
  );
};

export default GroupSettingsModal;

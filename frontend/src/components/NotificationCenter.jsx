import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellSolidIcon } from "@heroicons/react/24/solid";
import ModernCard from "./ModernCard";
import ModernButton from "./ModernButton";
import { useToast } from "../contexts/ToastContext";
import { useNotifications } from "../hooks/useNotifications";

const NotificationCenter = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteNotifications,
    getUnreadCount,
  } = useNotifications();
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      type: "success",
      title: "Paper Published Successfully",
      message:
        'Your research paper "AI in Healthcare" has been published and is now available.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      icon: DocumentTextIcon,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      actionUrl: "/papers/1",
    },
    {
      id: 2,
      type: "info",
      title: "New Group Member",
      message:
        'Dr. Sarah Johnson has joined the "Machine Learning Research" group.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      icon: UserGroupIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      actionUrl: "/groups/2",
    },
    {
      id: 3,
      type: "warning",
      title: "Milestone Deadline Approaching",
      message:
        'The "Data Collection Phase" milestone is due in 2 days. Please review progress.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: true,
      icon: ClipboardDocumentListIcon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      actionUrl: "/milestones/3",
    },
    {
      id: 4,
      type: "info",
      title: "File Shared",
      message:
        'Prof. Michael Johnson shared "Healthcare_Dataset.csv" with you.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      read: true,
      icon: FolderIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      actionUrl: "/files/4",
    },
    {
      id: 5,
      type: "success",
      title: "Collaboration Request Accepted",
      message:
        'Your collaboration request for the "Quantum Computing" project has been accepted.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      icon: CheckCircleIcon,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      actionUrl: "/groups/5",
    },
    {
      id: 6,
      type: "error",
      title: "Upload Failed",
      message:
        'Failed to upload "Research_Data.xlsx". Please check file size and try again.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      read: true,
      icon: ExclamationTriangleIcon,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      actionUrl: "/files",
    },
  ];

  // Get notification icon and colors based on type
  const getNotificationDisplay = (notification) => {
    const typeMap = {
      success: {
        icon: CheckCircleIcon,
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900/20",
      },
      error: {
        icon: ExclamationTriangleIcon,
        color: "text-red-600",
        bgColor: "bg-red-100 dark:bg-red-900/20",
      },
      warning: {
        icon: ExclamationTriangleIcon,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      },
      info: {
        icon: InformationCircleIcon,
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
      },
      paper: {
        icon: DocumentTextIcon,
        color: "text-indigo-600",
        bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
      },
      group: {
        icon: UserGroupIcon,
        color: "text-emerald-600",
        bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
      },
      milestone: {
        icon: ClipboardDocumentListIcon,
        color: "text-violet-600",
        bgColor: "bg-violet-100 dark:bg-violet-900/20",
      },
      file: {
        icon: FolderIcon,
        color: "text-orange-600",
        bgColor: "bg-orange-100 dark:bg-orange-900/20",
      },
    };

    return typeMap[notification.type] || typeMap.info;
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.read;
      case "read":
        return notification.read;
      default:
        return true;
    }
  });

  // Get unread count
  const unreadCount = getUnreadCount();

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success("All notifications marked as read");
  };

  // Delete notification
  const handleDeleteNotification = (notificationId) => {
    deleteNotification(notificationId);
    toast.success("Notification deleted");
  };

  // Delete selected notifications
  const deleteSelected = () => {
    deleteNotifications(selectedNotifications);
    setSelectedNotifications([]);
    toast.success(`${selectedNotifications.length} notifications deleted`);
  };

  // Toggle notification selection
  const toggleSelection = (notificationId) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Select all notifications
  const selectAll = () => {
    setSelectedNotifications(filteredNotifications.map((n) => n.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Here you would typically navigate to the notification's action URL
    toast.success(`Opening ${notification.title}`);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <BellSolidIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex space-x-1">
            {[
              { id: "all", name: "All", count: notifications.length },
              { id: "unread", name: "Unread", count: unreadCount },
              {
                id: "read",
                name: "Read",
                count: notifications.length - unreadCount,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  filter === tab.id
                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            {selectedNotifications.length > 0 ? (
              <>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedNotifications.length} selected
                </span>
                <ModernButton
                  variant="outline"
                  size="sm"
                  onClick={deleteSelected}
                >
                  Delete
                </ModernButton>
                <ModernButton
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear
                </ModernButton>
              </>
            ) : (
              <>
                {filteredNotifications.length > 0 && (
                  <ModernButton variant="ghost" size="sm" onClick={selectAll}>
                    Select All
                  </ModernButton>
                )}
                {unreadCount > 0 && (
                  <ModernButton
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark All Read
                  </ModernButton>
                )}
              </>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
                    !notification.read ? "bg-blue-50 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleSelection(notification.id)}
                      className="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <div
                      className={`${
                        getNotificationDisplay(notification).bgColor
                      } p-2 rounded-lg flex-shrink-0 mt-1`}
                    >
                      {(() => {
                        const IconComponent =
                          getNotificationDisplay(notification).icon;
                        return (
                          <IconComponent
                            className={`h-5 w-5 ${
                              getNotificationDisplay(notification).color
                            }`}
                          />
                        );
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4
                            className={`text-sm font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 ${
                              notification.read
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-900 dark:text-white font-semibold"
                            }`}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                              title="Mark as read"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDeleteNotification(notification.id)
                            }
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationCenter;

import { useState, useCallback } from "react";
import { useToast } from "../contexts/ToastContext";

// Mock notification storage (in a real app, this would be in a global state or backend)
let notificationStore = [
  {
    id: 1,
    type: "success",
    title: "Paper Published Successfully",
    message:
      'Your research paper "AI in Healthcare" has been published and is now available.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    category: "paper",
  },
  {
    id: 2,
    type: "info",
    title: "New Group Member",
    message:
      'Dr. Sarah Johnson has joined the "Machine Learning Research" group.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    category: "group",
  },
  {
    id: 3,
    type: "warning",
    title: "Milestone Deadline Approaching",
    message:
      'The "Data Collection Phase" milestone is due in 2 days. Please review progress.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    read: true,
    category: "milestone",
  },
  {
    id: 4,
    type: "info",
    title: "File Shared",
    message: 'Prof. Michael Johnson shared "Healthcare_Dataset.csv" with you.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    read: true,
    category: "file",
  },
];
let notificationListeners = [];

export const useNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(notificationStore);

  // Subscribe to notification updates
  const subscribeToNotifications = useCallback((listener) => {
    notificationListeners.push(listener);
    return () => {
      notificationListeners = notificationListeners.filter(
        (l) => l !== listener
      );
    };
  }, []);

  // Notify all listeners
  const notifyListeners = useCallback(() => {
    notificationListeners.forEach((listener) => listener(notificationStore));
  }, []);

  // Add a new notification
  const addNotification = useCallback(
    (notification) => {
      const newNotification = {
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        read: false,
        ...notification,
      };

      notificationStore = [newNotification, ...notificationStore];
      setNotifications([...notificationStore]);
      notifyListeners();

      // Also show as toast if specified
      if (notification.showToast !== false) {
        toast[notification.type || "info"](
          notification.message || notification.title
        );
      }

      return newNotification.id;
    },
    [toast, notifyListeners]
  );

  // Mark notification as read
  const markAsRead = useCallback(
    (notificationId) => {
      notificationStore = notificationStore.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );
      setNotifications([...notificationStore]);
      notifyListeners();
    },
    [notifyListeners]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    notificationStore = notificationStore.map((notification) => ({
      ...notification,
      read: true,
    }));
    setNotifications([...notificationStore]);
    notifyListeners();
  }, [notifyListeners]);

  // Delete notification
  const deleteNotification = useCallback(
    (notificationId) => {
      notificationStore = notificationStore.filter(
        (notification) => notification.id !== notificationId
      );
      setNotifications([...notificationStore]);
      notifyListeners();
    },
    [notifyListeners]
  );

  // Delete multiple notifications
  const deleteNotifications = useCallback(
    (notificationIds) => {
      notificationStore = notificationStore.filter(
        (notification) => !notificationIds.includes(notification.id)
      );
      setNotifications([...notificationStore]);
      notifyListeners();
    },
    [notifyListeners]
  );

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return notificationStore.filter((n) => !n.read).length;
  }, []);

  // Predefined notification creators for common actions
  const notifyPaperPublished = useCallback(
    (paperTitle, author) => {
      return addNotification({
        type: "success",
        title: "Paper Published Successfully",
        message: `"${paperTitle}" by ${author} has been published and is now available.`,
        icon: "DocumentTextIcon",
        actionUrl: "/papers",
        category: "paper",
      });
    },
    [addNotification]
  );

  const notifyGroupJoined = useCallback(
    (groupName, memberName) => {
      return addNotification({
        type: "info",
        title: "New Group Member",
        message: `${memberName} has joined the "${groupName}" group.`,
        icon: "UserGroupIcon",
        actionUrl: "/groups",
        category: "group",
      });
    },
    [addNotification]
  );

  const notifyMilestoneCompleted = useCallback(
    (milestoneTitle, teamName) => {
      return addNotification({
        type: "success",
        title: "Milestone Completed",
        message: `"${milestoneTitle}" has been completed by ${teamName}.`,
        icon: "ClipboardDocumentListIcon",
        actionUrl: "/milestones",
        category: "milestone",
      });
    },
    [addNotification]
  );

  const notifyMilestoneDeadline = useCallback(
    (milestoneTitle, daysLeft) => {
      return addNotification({
        type: "warning",
        title: "Milestone Deadline Approaching",
        message: `"${milestoneTitle}" is due in ${daysLeft} day${
          daysLeft !== 1 ? "s" : ""
        }. Please review progress.`,
        icon: "ClipboardDocumentListIcon",
        actionUrl: "/milestones",
        category: "milestone",
      });
    },
    [addNotification]
  );

  const notifyFileShared = useCallback(
    (fileName, sharedBy) => {
      return addNotification({
        type: "info",
        title: "File Shared",
        message: `${sharedBy} shared "${fileName}" with you.`,
        icon: "FolderIcon",
        actionUrl: "/files",
        category: "file",
      });
    },
    [addNotification]
  );

  const notifyFileUploadFailed = useCallback(
    (fileName, reason) => {
      return addNotification({
        type: "error",
        title: "Upload Failed",
        message: `Failed to upload "${fileName}". ${reason}`,
        icon: "FolderIcon",
        actionUrl: "/files",
        category: "file",
      });
    },
    [addNotification]
  );

  const notifyCollaborationRequest = useCallback(
    (projectName, requesterName, status) => {
      const isAccepted = status === "accepted";
      return addNotification({
        type: isAccepted ? "success" : "info",
        title: `Collaboration Request ${isAccepted ? "Accepted" : "Received"}`,
        message: isAccepted
          ? `Your collaboration request for "${projectName}" has been accepted.`
          : `${requesterName} sent you a collaboration request for "${projectName}".`,
        icon: "UserGroupIcon",
        actionUrl: "/groups",
        category: "collaboration",
      });
    },
    [addNotification]
  );

  const notifySystemUpdate = useCallback(
    (updateTitle, updateMessage) => {
      return addNotification({
        type: "info",
        title: updateTitle,
        message: updateMessage,
        icon: "InformationCircleIcon",
        category: "system",
        showToast: false, // Don't show toast for system notifications
      });
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteNotifications,
    getUnreadCount,
    subscribeToNotifications,

    // Predefined notification creators
    notifyPaperPublished,
    notifyGroupJoined,
    notifyMilestoneCompleted,
    notifyMilestoneDeadline,
    notifyFileShared,
    notifyFileUploadFailed,
    notifyCollaborationRequest,
    notifySystemUpdate,
  };
};

export default useNotifications;

import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  BellIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";

const Toast = ({ message, type = "info", duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const types = {
    success: {
      icon: CheckCircleIcon,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      textColor: "text-green-800 dark:text-green-200",
      iconColor: "text-green-500 dark:text-green-400",
    },
    error: {
      icon: ExclamationTriangleIcon,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      textColor: "text-red-800 dark:text-red-200",
      iconColor: "text-red-500 dark:text-red-400",
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      textColor: "text-yellow-800 dark:text-yellow-200",
      iconColor: "text-yellow-500 dark:text-yellow-400",
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-800 dark:text-blue-200",
      iconColor: "text-blue-500 dark:text-blue-400",
    },
    notification: {
      icon: BellIcon,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      textColor: "text-purple-800 dark:text-purple-200",
      iconColor: "text-purple-500 dark:text-purple-400",
    },
    paper: {
      icon: DocumentTextIcon,
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      borderColor: "border-indigo-200 dark:border-indigo-800",
      textColor: "text-indigo-800 dark:text-indigo-200",
      iconColor: "text-indigo-500 dark:text-indigo-400",
    },
    group: {
      icon: UserGroupIcon,
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      textColor: "text-emerald-800 dark:text-emerald-200",
      iconColor: "text-emerald-500 dark:text-emerald-400",
    },
    milestone: {
      icon: ClipboardDocumentListIcon,
      bgColor: "bg-violet-50 dark:bg-violet-900/20",
      borderColor: "border-violet-200 dark:border-violet-800",
      textColor: "text-violet-800 dark:text-violet-200",
      iconColor: "text-violet-500 dark:text-violet-400",
    },
    file: {
      icon: FolderIcon,
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      textColor: "text-orange-800 dark:text-orange-200",
      iconColor: "text-orange-500 dark:text-orange-400",
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div
      className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      transform transition-all duration-300 ease-out
      ${isLeaving ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
    `}
    >
      <div
        className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border rounded-2xl shadow-lg backdrop-blur-sm p-4
        flex items-start space-x-3
      `}
      >
        <Icon className={`h-6 w-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className={`${config.iconColor} hover:opacity-70 transition-opacity`}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

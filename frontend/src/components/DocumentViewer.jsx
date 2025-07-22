import React from "react";
import {
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import PDFViewer from "./PDFViewer";

const DocumentViewer = ({ fileUrl, fileName, mimeType }) => {
  // Function to determine if file can be viewed inline
  const canViewInline = (mimeType) => {
    const viewableTypes = [
      "application/pdf",
      "text/plain",
    ];
    return viewableTypes.includes(mimeType);
  };

  // Function to get file type display name
  const getFileTypeDisplay = (mimeType) => {
    const typeMap = {
      "application/pdf": "PDF Document",
      "application/msword": "Word Document (.doc)",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word Document (.docx)",
      "text/plain": "Text Document",
    };
    return typeMap[mimeType] || "Document";
  };

  // Function to get appropriate icon
  const getFileIcon = (mimeType) => {
    if (mimeType === "application/pdf") return "📄";
    if (mimeType === "text/plain") return "📝";
    if (mimeType === "application/msword" || 
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      return "📘";
    }
    return "📄";
  };

  // Handle download
  const handleDownload = () => {
    window.open(fileUrl, "_blank");
  };

  // If it's a PDF, use the PDFViewer
  if (mimeType === "application/pdf") {
    return (
      <PDFViewer
        fileUrl={fileUrl}
        fileName={fileName}
      />
    );
  }

  // If it's a text file, show it inline
  if (mimeType === "text/plain") {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getFileIcon(mimeType)}</span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {fileName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getFileTypeDisplay(mimeType)}
              </p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>

        {/* Text Content */}
        <div className="flex-1 overflow-auto p-6 bg-white dark:bg-gray-900">
          <iframe
            src={fileUrl}
            className="w-full h-full border border-gray-300 dark:border-gray-600 rounded-lg"
            title={fileName}
          />
        </div>
      </div>
    );
  }

  // For non-viewable files (DOCX, DOC), show download option
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-8">
      <div className="text-center max-w-md">
        {/* File Icon */}
        <div className="mb-6">
          <span className="text-6xl">{getFileIcon(mimeType)}</span>
        </div>

        {/* File Info */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {fileName}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {getFileTypeDisplay(mimeType)}
        </p>

        {/* Message */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <EyeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Preview Not Available
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This file type cannot be previewed in the browser. Please download the file to view its contents.
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Download {getFileTypeDisplay(mimeType)}
        </button>

        {/* Additional Info */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          The file will open in your default application for this file type.
        </p>
      </div>
    </div>
  );
};

export default DocumentViewer;

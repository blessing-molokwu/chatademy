import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid";
import LoadingSpinner from "./LoadingSpinner";

// PERMANENT SOLUTION: Use the worker that comes with react-pdf
// This ensures version compatibility since it's the exact worker react-pdf expects
import pdfjsWorker from "react-pdf/dist/pdf.worker.entry.js?url";
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PDFViewer = ({ fileUrl, fileName }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [pdfFile, setPdfFile] = useState(null);
  const [documentKey, setDocumentKey] = useState(0);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback(
    (error) => {
      console.error("PDF load error:", error);
      console.error("PDF URL:", fileUrl);
      setError(
        `Failed to load PDF: ${
          error.message || "The file might be corrupted or unsupported."
        }`
      );
      setLoading(false);

      // If it's a worker error, try to reset the document
      if (error.message && error.message.includes("sendWithPromise")) {
        console.log("Worker error detected, resetting document...");
        setTimeout(() => {
          setDocumentKey((prev) => prev + 1);
          setError(null);
          setLoading(true);
        }, 1000);
      }
    },
    [fileUrl]
  );

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(3.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.2));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const fitToWidth = () => {
    setScale(1.2); // Approximate fit-to-width scale
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const goToPage = (page) => {
    const pageNum = parseInt(page);
    if (pageNum >= 1 && pageNum <= numPages) {
      setPageNumber(pageNum);
    }
  };

  const toggleBookmark = () => {
    const newBookmarks = new Set(bookmarks);
    if (bookmarks.has(pageNumber)) {
      newBookmarks.delete(pageNumber);
    } else {
      newBookmarks.add(pageNumber);
    }
    setBookmarks(newBookmarks);
  };

  const isBookmarked = bookmarks.has(pageNumber);

  // Simple approach - let react-pdf handle the file loading
  useEffect(() => {
    if (fileUrl) {
      setLoading(true);
      setError(null);
      // Set the PDF file URL directly
      setPdfFile(fileUrl);
    }
  }, [fileUrl]);

  // Memoize the file prop to prevent unnecessary reloads
  const memoizedFile = useMemo(() => {
    if (!pdfFile) return null;

    return {
      url: pdfFile,
      httpHeaders: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    };
  }, [pdfFile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === "INPUT") return; // Don't interfere with input fields

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          goToPrevPage();
          break;
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          goToNextPage();
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
          e.preventDefault();
          zoomOut();
          break;
        case "0":
          e.preventDefault();
          resetZoom();
          break;
        case "f":
        case "F":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowSearch(!showSearch);
          } else {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };

    if (isFullscreen || document.activeElement?.closest(".pdf-viewer")) {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [isFullscreen, pageNumber, numPages, scale]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-800 p-8">
        <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Unable to Load PDF
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          {error}
        </p>
        <button
          onClick={() => window.open(fileUrl, "_blank")}
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <DocumentIcon className="h-4 w-4 mr-2" />
          Download PDF Instead
        </button>
      </div>
    );
  }

  return (
    <div
      className={`pdf-viewer flex flex-col h-full bg-gray-50 dark:bg-gray-900 ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      }`}
      tabIndex={0}
    >
      {/* PDF Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center space-x-2">
          {/* Page Navigation */}
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={pageNumber}
              onChange={(e) => goToPage(e.target.value)}
              className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="1"
              max={numPages}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              of {numPages || "..."}
            </span>
          </div>

          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked
                ? "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this page"}
          >
            {isBookmarked ? (
              <BookmarkIconSolid className="h-5 w-5" />
            ) : (
              <BookmarkIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Bar */}
          {showSearch && (
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search in PDF..."
                className="bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-none outline-none w-32"
                autoFocus
              />
              <button
                onClick={() => setShowSearch(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Search Toggle */}
          {!showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Search (Ctrl+F)"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          )}

          {/* Zoom Controls */}
          <button
            onClick={zoomOut}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MagnifyingGlassMinusIcon className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-1">
            <button
              onClick={fitToWidth}
              className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Fit to width"
            >
              Fit
            </button>
            <button
              onClick={resetZoom}
              className="px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {Math.round(scale * 100)}%
            </button>
          </div>

          <button
            onClick={zoomIn}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MagnifyingGlassPlusIcon className="h-5 w-5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="h-5 w-5" />
            ) : (
              <ArrowsPointingOutIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
        <div className="flex justify-center min-h-full">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading PDF...
              </p>
            </div>
          )}

          {memoizedFile && (
            <div className="w-full flex justify-center">
              <Document
                key={documentKey}
                file={memoizedFile}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading=""
                className="shadow-lg"
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  className="border border-gray-300 dark:border-gray-600 bg-white"
                  loading=""
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={undefined}
                  height={undefined}
                />
              </Document>
            </div>
          )}
        </div>
      </div>

      {/* PDF Footer */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {fileName}
          </div>
          {bookmarks.size > 0 && (
            <div className="flex items-center space-x-1">
              <BookmarkIconSolid className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {bookmarks.size} bookmark{bookmarks.size !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
            Use arrow keys to navigate • +/- to zoom • F for fullscreen • Ctrl+F
            to search
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {pageNumber} of {numPages}
            {isBookmarked && (
              <BookmarkIconSolid className="inline h-4 w-4 ml-1 text-yellow-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;

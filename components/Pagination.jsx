//Pagination.jsx

"use client";

import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  const [goToPage, setGoToPage] = useState("");
  const { width } = useWindowSize();
  const isMobile = width < 768; // Tailwind's 'md' breakpoint

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = parseInt(goToPage, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setGoToPage("");
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = isMobile ? 3 : 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(1, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages, currentPage + halfPagesToShow);

    if (currentPage - 1 <= halfPagesToShow) {
      endPage = Math.min(totalPages, maxPagesToShow);
    }

    if (totalPages - currentPage <= halfPagesToShow) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 hidden sm:inline"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(<span key="start-ellipsis" className="px-3 py-1 hidden sm:inline">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(<span key="end-ellipsis" className="px-3 py-1 hidden sm:inline">...</span>);
      }
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 hidden sm:inline"
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center items-center mt-6 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <FiChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center space-x-1 sm:space-x-2 mx-2">
        {renderPageNumbers()}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <FiChevronRight className="h-5 w-5" />
      </button>

      <form onSubmit={handleGoToPage} className="hidden sm:flex items-center ml-4">
        <span className="text-sm mr-2 text-gray-600 dark:text-gray-300">Go to</span>
        <input
          type="number"
          value={goToPage}
          onChange={(e) => setGoToPage(e.target.value)}
          className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
          min="1"
          max={totalPages}
        />
        <button
          type="submit"
          className="ml-2 px-4 py-1 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          Page
        </button>
      </form>
    </div>
  );
}


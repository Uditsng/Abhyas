'use client';

import { useState, useCallback } from 'react';

export function useCategoryState(initialCategory) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [currentPage, setCurrentPage] = useState(1);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const changeCategory = useCallback((newCategory) => {
    setActiveCategory(newCategory);
    resetPagination();
  }, [resetPagination]);

  return {
    activeCategory,
    setActiveCategory: changeCategory,
    currentPage,
    setCurrentPage,
    resetPagination
  };
} 
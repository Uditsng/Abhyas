'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize with a default value that won't cause hydration mismatch
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSystemPreference, setIsSystemPreference] = useState(false);

  // Apply theme to document
  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize theme on component mount
  useEffect(() => {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem('theme');

    if (storedTheme === 'dark') {
      setDarkMode(true);
      setIsSystemPreference(false);
      applyTheme(true);
    } else if (storedTheme === 'light') {
      setDarkMode(false);
      setIsSystemPreference(false);
      applyTheme(false);
    } else {
      // If no stored preference, use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      setIsSystemPreference(true);
      applyTheme(prefersDark);
    }

    setMounted(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      if (isSystemPreference) {
        setDarkMode(e.matches);
        applyTheme(e.matches);
      }
    };

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);

    // Clean up
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted, isSystemPreference]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;

      applyTheme(newMode);
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      setIsSystemPreference(false);

      return newMode;
    });
  };

  // Set theme based on system preference
  const useSystemTheme = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    setIsSystemPreference(true);
    applyTheme(prefersDark);
    localStorage.removeItem('theme');
  };

  return (
    <ThemeContext.Provider value={{
      darkMode,
      toggleDarkMode,
      useSystemTheme,
      mounted,
      isSystemPreference
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
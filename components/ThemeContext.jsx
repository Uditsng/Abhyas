'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize with undefined to avoid hydration mismatch
  const [darkMode, setDarkMode] = useState(undefined);
  const [mounted, setMounted] = useState(false);
  const [isSystemPreference, setIsSystemPreference] = useState(false);

  // Apply theme to document - only run on client
  const applyTheme = (isDark) => {
    if (typeof document === 'undefined') return;

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize theme on component mount
  useEffect(() => {
    try {
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
    } catch (error) {
      console.error('Error initializing theme:', error);
      // Fallback to light theme
      setDarkMode(false);
      setIsSystemPreference(false);
      applyTheme(false);
    }

    setMounted(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;

    try {
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
    } catch (error) {
      console.error('Error setting up theme listener:', error);
    }
  }, [mounted, isSystemPreference]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    try {
      setDarkMode(prevMode => {
        const newMode = !prevMode;

        applyTheme(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
        setIsSystemPreference(false);

        return newMode;
      });
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  // Set theme based on system preference
  const useSystemTheme = () => {
    try {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      setIsSystemPreference(true);
      applyTheme(prefersDark);
      localStorage.removeItem('theme');
    } catch (error) {
      console.error('Error setting system theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{
      darkMode,
      toggleDarkMode,
      useSystemTheme,
      mounted,
      isSystemPreference
    }}>
      {/* Only render children once mounted to prevent hydration mismatch */}
      {mounted ? children : null}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
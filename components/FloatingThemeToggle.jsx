'use client';

import { useTheme } from '@/components/ThemeContext';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { IconButton, Tooltip } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';
import { useEffect } from 'react';

export default function FloatingThemeToggle() {
  const { darkMode, toggleDarkMode, mounted } = useTheme();
  const { setColorMode, colorMode } = useColorMode();

  // Sync Chakra UI's color mode with our theme context
  useEffect(() => {
    if (mounted && colorMode !== (darkMode ? 'dark' : 'light')) {
      setColorMode(darkMode ? 'dark' : 'light');
    }
  }, [darkMode, mounted, setColorMode, colorMode]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Tooltip label={darkMode ? "Switch to light mode" : "Switch to dark mode"} placement="left">
        <IconButton
          onClick={toggleDarkMode}
          aria-label="Toggle theme"
          icon={darkMode ? <SunIcon /> : <MoonIcon />}
          size="lg"
          isRound={true}
          colorScheme={darkMode ? "yellow" : "purple"}
          boxShadow="lg"
          _hover={{ transform: 'scale(1.1)' }}
          transition="all 0.2s"
        />
      </Tooltip>
    </div>
  );
}

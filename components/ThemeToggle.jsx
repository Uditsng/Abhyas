'use client';

import { useTheme } from '@/components/ThemeContext';
import { SunIcon, MoonIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  Tooltip
} from '@chakra-ui/react';
import { useEffect } from 'react';

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode, useSystemTheme, mounted, isSystemPreference } = useTheme();
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
    <Menu placement="bottom-end">
      <Tooltip label="Theme settings" placement="bottom">
        <MenuButton
          as={IconButton}
          aria-label="Theme options"
          icon={darkMode ? <MoonIcon /> : <SunIcon />}
          variant="ghost"
          size="md"
          color={darkMode ? "gray.200" : "gray.700"}
          _hover={{ bg: darkMode ? "gray.700" : "gray.200" }}
        />
      </Tooltip>
      <MenuList>
        <MenuItem
          icon={<SunIcon />}
          onClick={() => {
            if (darkMode) toggleDarkMode();
          }}
          fontWeight={!darkMode && !isSystemPreference ? "bold" : "normal"}
        >
          Light Mode
        </MenuItem>
        <MenuItem
          icon={<MoonIcon />}
          onClick={() => {
            if (!darkMode) toggleDarkMode();
          }}
          fontWeight={darkMode && !isSystemPreference ? "bold" : "normal"}
        >
          Dark Mode
        </MenuItem>
        <MenuItem
          icon={<SettingsIcon />}
          onClick={useSystemTheme}
          fontWeight={isSystemPreference ? "bold" : "normal"}
        >
          Use System Theme
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
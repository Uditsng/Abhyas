// Created Providers.jsx because chakra UI require client components as it uses react hook internally

'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { AuthProvider } from '@/components/AuthContext';
import { ThemeProvider } from '@/components/ThemeContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingThemeToggle from '@/components/FloatingThemeToggle';
import PerformanceOptimizer from '@/components/PerformanceOptimizer';
import { memo } from 'react';

// Define a custom theme for Chakra UI
const theme = extendTheme({
  config: {
    // Disable Chakra's auto color mode detection - we'll handle this ourselves
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: () => ({
      // Ensure Chakra's global styles don't override Tailwind's dark mode
      body: {
        bg: 'transparent', // Use transparent to let Tailwind handle background
        color: 'inherit', // Use inherit to let Tailwind handle text color
      },
    }),
  },
  colors: {
    brand: {
      50: '#e6f1ff',
      100: '#b8d4ff',
      200: '#8ab7ff',
      300: '#5c9aff',
      400: '#2e7dff',
      500: '#0064e6',
      600: '#004fb4',
      700: '#003a82',
      800: '#002551',
      900: '#001021',
    },
  },
  // Customize components to work better with Tailwind dark mode
  components: {
    Button: {
      baseStyle: (props) => ({
        _hover: {
          bg: props.colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.100',
        },
      }),
    },
    Menu: {
      baseStyle: (props) => ({
        list: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
        },
        item: {
          bg: 'transparent',
          _hover: {
            bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
          },
          _focus: {
            bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
          },
        },
      }),
    },
  },
});

// Memoize the Providers component to prevent unnecessary re-renders
function Providers({ children }) {
  return (
    <ThemeProvider>
      <ChakraProvider theme={theme} resetCSS={false}>
        <AuthProvider>
          <PerformanceOptimizer />
          <Navbar />
          {children}
          <Footer />
          <FloatingThemeToggle />
        </AuthProvider>
      </ChakraProvider>
    </ThemeProvider>
  );
}

export default memo(Providers);


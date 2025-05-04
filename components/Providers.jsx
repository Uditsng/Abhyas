// Created Providers.jsx because chakra UI require client components as it uses react hook internally

'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { AuthProvider } from '@/components/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Define a custom theme if needed
const theme = extendTheme({
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
});

export default function Providers({ children }) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Navbar />
        {children}
        <Footer />
      </AuthProvider>
    </ChakraProvider>
  );
}

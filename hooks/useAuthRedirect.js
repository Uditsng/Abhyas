'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

/**
 * Hook to handle authentication redirects
 * @param {string} redirectPath - Path to redirect to if user is not authenticated
 * @returns {Object} - Object containing authentication state
 */
export function useAuthRedirect(redirectPath = '/auth/login') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after auth state is determined (not loading)
    if (!loading && !user) {
      console.log('User not authenticated, redirecting to', redirectPath);
      router.push(redirectPath);
    }
  }, [user, loading, router, redirectPath]);

  return { 
    isAuthenticated: !!user, 
    isLoading: loading,
    user
  };
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

export function useAuthRedirect({redirectPath = '/auth/login', allowedRoles = ['user'] } = {}) {
  const { user, loading,role } = useAuth();
  const router = useRouter();

  useEffect(() => {

        if (loading) {
      return;
    }
    // Only redirect after auth state is determined (not loading)
    if (!user) {
      console.log('User not authenticated, redirecting to', redirectPath);
      router.replace(redirectPath);
      return ;
    }
    if (!allowedRoles.includes(role)) {
      console.log(`User role "${role}" is not authorized. Redirecting.`);
      // Redirect to a default page based on their role
      if (role === 'admin' || role === 'superAdmin') {
        router.replace('/admin');
      } else {
        router.replace('/'); // Fallback for any other case
      }
      return;
    }
  }, [user, loading,role, router, redirectPath, allowedRoles]);

  return { 
    isAuthenticated: !!user && allowedRoles.includes(role), 
    isLoading: loading,
    user
  };
}

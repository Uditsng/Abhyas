'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import {auth} from '@/lib/firebase'
import { syncBookmarks } from '@/lib/bookmarkService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      
      if (user) {
        setUser(user);
        
        // Sync bookmarks when user logs in
        await syncBookmarks(user.uid);
        
        // Rest of your existing login logic
        // ...
      } else {
        setUser(null);
        
        // Clear user-specific data from localStorage on logout
        // but keep bookmarks for potential sync later
        // ...
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      return await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error during sign-in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Sync bookmarks before signing out to ensure latest data is saved
      if (user) {
        await syncBookmarks(user.uid);
      }
      
      await signOut(auth);
      // Rest of your existing logout logic
      // ...
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

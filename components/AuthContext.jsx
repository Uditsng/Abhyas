'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, signInWithEmailAndPassword } from 'firebase/auth';
import {auth} from '@/lib/firebase'
import { syncBookmarks } from '@/lib/bookmarkService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set loading initially
    setLoading(true);

    // Check if we have a cached user in localStorage
    const cachedUser = localStorage.getItem('cachedUser');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
        setLoading(false);
      } catch (e) {
        console.error('Error parsing cached user:', e);
      }
    }

    // Then listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Cache user data in localStorage
        localStorage.setItem('cachedUser', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }));

        setUser(user);

        // Sync bookmarks in the background
        setTimeout(() => {
          syncBookmarks(user.uid).catch(err =>
            console.error('Background bookmark sync failed:', err)
          );
        }, 2000);
      } else {
        localStorage.removeItem('cachedUser');
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      if (email && password) {
        return await signInWithEmailAndPassword(auth, email, password);
      } else {
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(auth, provider);
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Sync bookmarks before signing out to ensure latest data is saved
      if (user) {
        await syncBookmarks(user.uid);
      }

      await firebaseSignOut(auth);
      // Rest of your existing logout logic
      // ...
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

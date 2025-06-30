//Authentication: Handled via Login-page.jsx and register-page.jsx, with logic and state managed in AuthContext.jsx.

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebaseConfig';
import { syncBookmarks } from '@/lib/bookmarkService';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    const initializeAuth = async () => {
      try {
        // Set loading initially
        setLoading(true);

        // Check if we have a cached user in localStorage
        const cachedUser = localStorage.getItem('cachedUser');
        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            setUser(parsedUser);
          } catch (e) {
            console.error('Error parsing cached user:', e);
            localStorage.removeItem('cachedUser');
          }
        }

        // Listen for auth state changes
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              // Get user data from Firestore
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              const userData = userDoc.data();
              
              const userWithRole = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: userData?.role || "student",
                isAdmin: userData?.isAdmin || false
              };

              console.log('User data from Firestore:', userData);
              console.log('User with role:', userWithRole);

              // Cache user data in localStorage
              localStorage.setItem('cachedUser', JSON.stringify(userWithRole));
              setUser(userWithRole);

              // Sync bookmarks in the background
              setTimeout(() => {
                syncBookmarks(firebaseUser.uid).catch(err =>
                  console.error('Background bookmark sync failed:', err)
                );
              }, 2000);
            } catch (error) {
              console.error('Error fetching user data:', error);
              setUser(null);
            }
          } else {
            localStorage.removeItem('cachedUser');
            setUser(null);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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
      if (user) {
        await syncBookmarks(user.uid);
      }
      await firebaseSignOut(auth);
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

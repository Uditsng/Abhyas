//Authentication: Handled via Login-page.jsx and register-page.jsx, with logic and state managed in AuthContext.jsx.

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebaseConfig';
import { syncBookmarks } from '@/lib/bookmarkService';
import { doc, getDoc,onSnapshot } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionUnsub, setSessionUnsub] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const initializeAuth = async () => {
      try {
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
                role: userData?.role || "user",
                isAdmin: userData?.isAdmin || false
              };

              console.log('User data from Firestore:', userData);
              console.log('User with role:', userWithRole);

              // Cache user data in localStorage
              localStorage.setItem('cachedUser', JSON.stringify(userWithRole));
              setUser(userWithRole);

              // start session listener if we have local sessionId (for realtime revoke)
              const localSessionId = localStorage.getItem('abhyas_session_id');
              if (localSessionId) {
                const sessionRef = doc(db, 'sessions', localSessionId);
                const unsub = onSnapshot(sessionRef, (snap) => {
                  if (!snap.exists()) {
                    // session removed -> force logout
                    firebaseSignOut(auth);
                    localStorage.removeItem('abhyas_session_id');
                  } else {
                    const s = snap.data();
                    if (s.status !== 'active') {
                      firebaseSignOut(auth);
                      localStorage.removeItem('abhyas_session_id');
                    }
                  }
                });
                // cleanup previous listener if any
                if (sessionUnsub) sessionUnsub();
                setSessionUnsub(() => unsub);
              }


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
            // clear any session listener
            if (sessionUnsub) {
              sessionUnsub();
              setSessionUnsub(null);
            }
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
      if (unsubscribe) unsubscribe();
      if (sessionUnsub) sessionUnsub();  
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

      // call server to revoke session + clear cookie
      try {
        await fetch('/api/sessions/revoke', { method: 'POST', credentials: 'include' });
      } catch (e) {
        console.warn('Session revoke failed:', e);
      }

      await firebaseSignOut(auth);
      // cleanup client-side session info
      localStorage.removeItem('abhyas_session_id');
      localStorage.removeItem('cachedUser');

      if (sessionUnsub) {
        sessionUnsub();
        setSessionUnsub(null);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || "student", signIn, logout, loading }}>
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

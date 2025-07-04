'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import Link from 'next/link';
import { auth } from '@/lib/firebaseConfig';
import { useAuth } from '@/components/AuthContext';
import { saveUserProfile, getUserProfile } from '@/lib/userService';

export default function RegisterPage() {

  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const {signIn} = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');



    if (!name || !email || !password) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create the user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // 2. Update the user's display name
      await updateProfile(user, { displayName: name });

      // 3. Create a document in the users collection
      const userData = {
        name: name,
        email: email,
        displayName: name,
        role: "user", // Default role (may be changed to superAdmin if first user)
        createdAt: new Date(),
      };

      const profileSaved = await saveUserProfile(user.uid, userData);

      if (!profileSaved) {
        console.error("Failed to save user profile to Firestore");
      }

      // 4. Check if user was made a superAdmin (first user in system)
      const userProfile = await getUserProfile(user.uid);
      const isSuperAdmin = userProfile && userProfile.role === 'superAdmin';

      // 5. Show success message
      setSuccess(true);
      // 6. Redirect after a short delay
      setTimeout(() => {
        router.push(isSuperAdmin ? '/admin' : '/dashboard');
      }, 2000);

    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';

      // Extract specific Firebase error messages
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please use a different email.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }

      setError(errorMessage);
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg shadow-blue-500/50 dark:shadow-cyan-500/50 w-full max-w-md transition-colors duration-200">
        <h2 className="text-2xl text-center font-bold mb-6 text-blue-500 dark:text-cyan-100">Register</h2>

        {success ? (
          <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
            {isSuperAdmin ? (
              <>
                <p className="font-bold">Registration successful!</p>
                <p>You are the first user, so you've been made a SuperAdmin.</p>
                <p>Redirecting to admin panel...</p>
              </>
            ) : (
              <p>Registration successful! Redirecting to dashboard...</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className={`w-full bg-green-600 text-white py-2 rounded-2xl p-3 hover:bg-green-700 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  setIsLoading(true);
                  await signIn(); // Ensure this function is implemented in AuthContext
                  router.push('/dashboard');
                } catch (err) {
                  setError('Google sign-in failed. Please try again.');
                } finally {
                  setIsLoading(false);
                }
              }}
              className={`w-full bg-blue-600 text-white my-2 py-2 rounded-2xl p-3 hover:bg-blue-700 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>



            <div className="text-center mt-4">
              <p className="text-gray-700 dark:text-gray-300">Already have an account? <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline">Login here</Link></p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext'; // Ensure this is correctly implemented and provides signIn
import { auth } from '@/lib/firebase';

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
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Save name temporarily in local Storage for greeting
      localStorage.setItem('mockUser', JSON.stringify({ name, email }));

      // Show success message
      setSuccess(true);

      // Redirect after a short delay to let user see success message
      setTimeout(() => {
        router.push('/dashboard');
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md transition-colors duration-200">
        <h1 className="text-2xl text-center font-bold mb-6 text-gray-900 dark:text-gray-100">Register</h1>

        {success ? (
          <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
            <p>Registration successful! Redirecting to dashboard ...</p>
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
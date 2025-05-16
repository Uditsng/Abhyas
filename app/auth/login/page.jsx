'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase'
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      setIsLoading(false);
      return;
    }

    try {
      // Use await to properly handle the Promise
      await signInWithEmailAndPassword(auth, email, password);

      // Store user info in localStorage
      const storedUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
      if (storedUser && storedUser.email === email) {
        localStorage.setItem('mockUser', JSON.stringify({
          name: storedUser.name,
          email: email
        }));
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + (error.message || 'Please check your credentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700
                     text-gray-900 dark:text-gray-100 px-3 py-2 mb-3 rounded-md transition-colors duration-200"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700
                     text-gray-900 dark:text-gray-100 px-3 py-2 mb-4 rounded-md transition-colors duration-200"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800
                     text-white py-2 rounded-md transition-colors duration-200"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login with Email'}
        </button>
      </form>

      <div className="mt-4">
        <button
          onClick={async () => {
            try {
              setIsLoading(true);
              const provider = new GoogleAuthProvider();
              await signInWithPopup(auth, provider);
              router.push('/dashboard');
            } catch (error) {
              console.error('Google sign-in error:', error);
              alert('Google sign-in failed: ' + (error.message || 'Please try again'));
            } finally {
              setIsLoading(false);
            }
          }}
          className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800
                     text-white py-2 rounded-md transition-colors duration-200"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>

      <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 hover:underline">
          Register
        </Link>
      </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {auth} from '@/lib/firebase'
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {signIn } = useAuth()


  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (email && password) {
      setIsLoading(false);
      return;
    }

    try{
      const userCred = signInWithEmailAndPassword(auth, email, password)
      const user = userCred.user;

      const storedUser = JSON.parse(localStorage.getItem('mockUser'))
      if (storedUser && storedUser.email === email){

        localStorage.setItem('mockUser', JSON.stringify 
          ({
            name: storedUser.name,
             email: email
      }))
      }

      router.push('/dashboard')
    } finally{
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      
      <form onSubmit={handleLogin}>
        <input
          type="email"
          className="w-full border px-3 py-2 mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full border px-3 py-2 mb-4"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded-2xl p-3 hover:bg-blue-700 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                setIsLoading(true);
                await signIn();
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
            <p>Don't have an account? <Link href="/auth/register" className="text-blue-600 hover:underline">Register here</Link></p>
          </div>

      </form>
    </div>
  );
}

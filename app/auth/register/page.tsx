'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const user = localStorage.getItem('mockUser');
    if (user) router.push('/dashboard');
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }

    const newUser = {
      name,
      email,
      password,
    };

    localStorage.setItem('mockUser', JSON.stringify(newUser));
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl text-center font-bold mb-6">Register</h1>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border border-gray-400 rounded-2xl mb-4 p-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-400 rounded-2xl mb-4 p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-400 rounded-2xl mb-4 p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-2xl p-3 hover:bg-green-700"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

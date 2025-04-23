'use client'

import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registration submitted:', { name, email, password });
    
    // registration logic
    if (email && password && name) {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <Head>
        <title>Register | Mock Test App</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl text-center font-bold mb-6">Register</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border border-gray-400 rounded-2xl mb-4 p-3"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-400 rounded-2xl mb-4 p-3"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-400 rounded-2xl mb-4 p-3"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-2xl p-3 hover:bg-green-700">
              Register
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
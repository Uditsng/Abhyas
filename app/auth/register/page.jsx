'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import Link from 'next/link';
import { auth } from '@/lib/firebaseConfig';
import { useAuth } from '@/components/AuthContext';
import { saveUserProfile, getUserProfile } from '@/lib/userService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

function UserRegister({ onRegister, isLoading, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form onSubmit={e => onRegister(e, { name, email, password })}>
      <input type="text" placeholder="Full Name" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={name} onChange={e => setName(e.target.value)} required />
      <input type="email" placeholder="Email" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={password} onChange={e => setPassword(e.target.value)} required />
      {error && <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4"><p>{error}</p></div>}
      <button type="submit" className={`w-full bg-green-600 text-white py-2 rounded-2xl p-3 hover:bg-green-700 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={isLoading}>{isLoading ? 'Registering...' : 'Register'}</button>
    </form>
  );
}

function AdminRegister({ onRegister, isLoading, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [experience, setExperience] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  return (
    <form onSubmit={e => onRegister(e, { name, email, password, qualifications, subjects, experience, phone, profilePic })}>
      <input type="text" placeholder="Full Name" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={name} onChange={e => setName(e.target.value)} required />
      <input type="email" placeholder="Email" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={password} onChange={e => setPassword(e.target.value)} required />
      <input type="text" placeholder="Qualifications" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={qualifications} onChange={e => setQualifications(e.target.value)} required />
      <input type="text" placeholder="Subjects/Exams Taught" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={subjects} onChange={e => setSubjects(e.target.value)} required />
      <input type="text" placeholder="Teaching Experience (years or description)" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={experience} onChange={e => setExperience(e.target.value)} required />
      <input type="tel" placeholder="Phone Number" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={phone} onChange={e => setPhone(e.target.value)} required />
      <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Profile Picture</label>
      <input type="file" accept="image/*" className="mb-4" onChange={e => setProfilePic(e.target.files[0])} />
      {error && <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4"><p>{error}</p></div>}
      <button type="submit" className={`w-full bg-green-600 text-white py-2 rounded-2xl p-3 hover:bg-green-700 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={isLoading}>{isLoading ? 'Registering...' : 'Register as Admin'}</button>
    </form>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [registerRole, setRegisterRole] = useState('user');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e, formData) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const { name, email, password, qualifications, subjects, experience, phone, profilePic } = formData;
    if (!name || !email || !password || (registerRole === 'admin' && (!qualifications || !subjects?.length || !experience || !phone))) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      await updateProfile(user, { displayName: name });
      const userData = {
        name,
        email,
        displayName: name,
        role: registerRole,
        createdAt: new Date(),
      };
      if (registerRole === 'admin') {
        userData.qualifications = qualifications;
        userData.subjects = subjects;
        userData.experience = experience;
        userData.phone = phone;
        userData.validated = false;
        if (profilePic) {
          // You can implement upload logic here
          userData.profilePic = profilePic.name;
        }
      }
      const profileSaved = await saveUserProfile(user.uid, userData);
      if (!profileSaved) {
        console.error('Failed to save user profile to Firestore');
      }
      const userProfile = await getUserProfile(user.uid);
      const isSuperAdminUser = userProfile && userProfile.role === 'superAdmin';
      setIsSuperAdmin(isSuperAdminUser);
      setSuccess(true);
      setTimeout(() => {
        if (isSuperAdminUser) {
          router.push('/superAdmin');
        } else if (userProfile?.role === 'admin' && userProfile?.validated === false) {
          router.push('/admin/pending-approval');
        } else if (userProfile?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }, 2000);
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please use a different email.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg shadow-blue-500/50 dark:shadow-cyan-500/50 w-full max-w-lg transition-colors duration-200 mt-24 mb-8">
        <h2 className="text-2xl text-center font-bold mb-6 text-blue-500 dark:text-cyan-100">Register</h2>
        <div className="flex justify-center mb-6 gap-4">
          <button onClick={() => setRegisterRole('user')} className={`px-4 py-2 rounded-full font-semibold ${registerRole === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>User</button>
          <button onClick={() => setRegisterRole('admin')} className={`px-4 py-2 rounded-full font-semibold ${registerRole === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>Admin</button>
        </div>
        {success ? (
          <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
            {isSuperAdmin ? (
              <>
                <p className="font-bold">Registration successful!</p>
                <p>You are the first user, so you've been made a SuperAdmin.</p>
                <p>Redirecting to SuperAdmin panel...</p>
              </>
            ) : (
              <p>Registration successful! Redirecting to dashboard...</p>
            )}
          </div>
        ) : (
          <div className="w-full max-w-lg">
            {registerRole === 'admin' ? (
              <AdminRegister onRegister={handleRegister} isLoading={isLoading} error={error} />
            ) : (
              <UserRegister onRegister={handleRegister} isLoading={isLoading} error={error} />
            )}
            <div className="text-center mt-4">
              <p className="text-gray-700 dark:text-gray-300">Already have an account? <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline">Login here</Link></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

//register/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import Link from 'next/link';
import { auth } from '@/lib/firebaseConfig';
import { useAuth } from '@/components/AuthContext';
import { saveUserProfile, getUserProfile } from '@/lib/userService';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary'

function UserRegister({ onRegister, isLoading, error, formData, setFormData }) {
  return (
    <form onSubmit={onRegister}>
      <input type="text" placeholder="Full Name" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
      <input type="email" placeholder="Email" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
      <input type="password" placeholder="Password" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
      {error && <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4"><p>{error}</p></div>}
      <button type="submit" className={`w-full bg-green-600 text-white py-2 rounded-2xl p-3 hover:bg-green-700 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={isLoading}>{isLoading ? 'Sending OTP...' : 'Send OTP'}</button>
    </form>
  );
}

function AdminRegister({ onRegister, isLoading, error, formData, setFormData }) {
  return (
    <form onSubmit={onRegister}>
        <input type="text" placeholder="Full Name" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
        <input type="email" placeholder="Email" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
        <input type="password" placeholder="Password" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
        <input type="text" placeholder="Qualifications" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={formData.qualifications || ''} onChange={e => setFormData({ ...formData, qualifications: e.target.value })} required />
        <input type="text" placeholder="Subjects/Exams Taught" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={formData.subjects || ''} onChange={e => setFormData({ ...formData, subjects: e.target.value })} required />
        <input type="text" placeholder="Teaching Experience (years or description)" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={formData.experience || ''} onChange={e => setFormData({ ...formData, experience: e.target.value })} required />
        <input type="tel" placeholder="Phone Number" className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Profile Picture</label>
        <input type="file" accept="image/*" className="mb-4" onChange={e => setFormData({ ...formData, profilePic: e.target.files[0] })} />
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
    const [step, setStep] = useState('details');
    const [formData, setFormData] = useState({});
    const [otp, setOtp] = useState('');

    const handleDetailsSubmit = async (e, submittedFormData) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        // Store the form data from the child component
        const currentFormData = { ...formData, ...submittedFormData };
        setFormData(currentFormData);

        if (!currentFormData.email) {
            setError('Email is required to send OTP.');
            setIsLoading(false);
            return;
        }

        try {
            const otpResponse = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentFormData.email }),
            });

            if (!otpResponse.ok) {
                throw new Error('Failed to send OTP. Please try again.');
            }
            setStep('otp');
        } catch (err) {
            setError(err.message || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // First, verify the OTP
            const verifyResponse = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp }),
            });

            if (!verifyResponse.ok) {
                throw new Error('Invalid or expired OTP.');
            }

            const { name, email, password, qualifications, subjects, experience, phone, profilePic } = formData;
            if (!name || !email || !password || (registerRole === 'admin' && (!qualifications || !subjects || !experience || !phone))) {
                setError('All fields are required');
                setIsLoading(false);
                return;
            }

            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCred.user;
            
            let profilePicUrl ='';
            if (registerRole === 'admin' && profilePic){
                try{
                    profilePicUrl = await uploadToCloudinary(profilePic)
                } catch (uploadError){
                    console.error("Image upload failed:", uploadError)
                }
            }

            await updateProfile(user, { displayName: name, photoURL: profilePicUrl });
            const userData = {
                name, email, displayName: name, role: registerRole,
                createdAt: new Date(), photURL: profilePicUrl,
            };
            if (registerRole === 'admin') {
                userData.qualifications = qualifications;
                userData.subjects = subjects;
                userData.experience = experience;
                userData.phone = phone;
                userData.validated = false;
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
            if (err.message.includes('Invalid or expired OTP')) {
                errorMessage = err.message;
            } else if (err.code === 'auth/email-already-in-use') {
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-200">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg shadow-blue-500/50 dark:shadow-cyan-500/50 w-full max-w-md transition-colors duration-200 mt-24 mb-8">
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
                        {step === 'details' ? (
                            registerRole === 'admin' ? (
                                <AdminRegister onRegister={handleDetailsSubmit} isLoading={isLoading} error={error} formData={formData} setFormData={setFormData} />
                            ) : (
                                <UserRegister onRegister={handleDetailsSubmit} isLoading={isLoading} error={error} formData={formData} setFormData={setFormData} />
                            )
                        ) : (
                            // form for entering the OTP
                            <form onSubmit={handleRegister}>
                                <p className="text-center text-gray-700 dark:text-gray-300 mb-4">An OTP has been sent to {formData.email}.</p>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                                {error && <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4"><p>{error}</p></div>}
                                <button type="submit" className={`w-full bg-green-600 text-white py-2 rounded-2xl p-3 hover:bg-green-700 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={isLoading}>
                                    {isLoading ? 'Verifying...' : 'Complete Registration'}
                                </button>
                                <button type="button" onClick={() => setStep('details')} className="w-full text-center text-blue-600 dark:text-blue-400 mt-2 hover:underline">
                                    Back to Details
                                </button>
                            </form>
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
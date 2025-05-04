'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "./AuthContext"
import Link from "next/link"

export default function Navbar() {

    const router = useRouter()
    const [username, setUsername] = useState('')
    const { user, logout } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        // Fetch username from local storage
        const storedUser = localStorage.getItem('mockUser') ? 
            JSON.parse(localStorage.getItem('mockUser')) : null;
            
        if (storedUser && storedUser.name) {
            setUsername(storedUser.name);
        } else if (user && user.displayName) {
            setUsername(user.displayName);
        } else if (user && user.email) {
            setUsername(user.email.split('@')[0]);
        }
    }, [user]);

    const handleLogout = async()=>{
        try{
            //1st signOut from firebase
            if(logout){
                await logout();
            }
            localStorage.removeItem('mockUser');
            setUsername('');
            router.push('/');
        } catch (error) {
            console.error("Logout failed:", error);
            localStorage.removeItem('mockUser');
            setUsername('');
            router.push('/');
        }
    }
    
    // Toggle mobile menu
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    }
    
    return (
        <nav className="bg-white shadow p-4">
            <div className="container mx-auto">
                {/* Navbar content */}
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div>
                        <h1 
                            onClick={() => router.push('/')}
                            className="text-xl font-bold cursor-pointer">
                            MockTestApp
                        </h1>
                    </div>
                    
                    {/* Hamburger menu for mobile */}
                    <div className="block md:hidden">
                        <button 
                            onClick={toggleMenu}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            {menuOpen ? (
                                <span className="text-2xl">✕</span> // X icon when menu is open
                            ) : (
                                <span className="text-2xl">☰</span> // Hamburger icon when menu is closed
                            )}
                        </button>
                    </div>
                    
                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {username ? (
                            <>
                                <span className="text-gray-700">Hi, {username}</span>
                                <button 
                                    onClick={() => router.push('/dashboard')}
                                    className="text-blue-600 hover:underline">
                                    Dashboard
                                </button>
                                <button 
                                    onClick={() => router.push('/profile')}
                                    className="text-blue-600 hover:underline">
                                    Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="text-red-600 hover:underline">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => router.push('/auth/register')}
                                    className="text-blue-600 hover:underline">
                                    Register
                                </button>
                                <button 
                                    onClick={() => router.push('/auth/login')}
                                    className="text-blue-600 hover:underline">
                                    Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
                
                {/* Mobile menu - only shows when menuOpen is true */}
                {menuOpen && (
                    <div className="mt-4 md:hidden border-t pt-4">
                        {username ? (
                            <div className="flex flex-col space-y-3">
                                <span className="text-gray-700">Hi, {username}</span>
                                <button 
                                    onClick={() => {
                                        router.push('/dashboard');
                                        setMenuOpen(false);
                                    }}
                                    className="text-blue-600 hover:underline text-left">
                                    Dashboard
                                </button>
                                <button 
                                    onClick={() => {
                                        router.push('/profile');
                                        setMenuOpen(false);
                                    }}
                                    className="text-blue-600 hover:underline text-left">
                                    Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="text-red-600 hover:underline text-left">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-3">
                                <button 
                                    onClick={() => {
                                        router.push('/auth/register');
                                        setMenuOpen(false);
                                    }}
                                    className="text-blue-600 hover:underline text-left">
                                    Register
                                </button>
                                <button 
                                    onClick={() => {
                                        router.push('/auth/login');
                                        setMenuOpen(false);
                                    }}
                                    className="text-blue-600 hover:underline text-left">
                                    Login
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}

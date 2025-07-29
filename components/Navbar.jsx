"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState("");
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { mounted } = useTheme();

  useEffect(() => {
    // Only run on client-side to prevent hydration mismatch
    if (typeof window === "undefined") return;

    try {
      // Fetch username from local storage
      const storedUser = localStorage.getItem("mockUser")
        ? JSON.parse(localStorage.getItem("mockUser"))
        : null;

      if (storedUser && storedUser.name) {
        setUsername(storedUser.name);
      } else if (user && user.displayName) {
        setUsername(user.displayName);
      } else if (user && user.email) {
        setUsername(user.email.split("@")[0]);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      //1st signOut from firebase
      if (logout) {
        await logout();
      }
      localStorage.removeItem("mockUser");
      setUsername("");
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("mockUser");
      setUsername("");
      router.push("/");
    }
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Don't render anything until client-side hydration is complete
  if (!mounted) return null;

  // Hide Navbar on test-taking page
  //ToDo: regex study about that
  if (/^\/tests(\/[^\/]+){1,2}$/.test(pathname)) {
    return null;
  }

  return (
    <nav className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-xl fixed w-full z-50 p-4">
      <div className="container mx-auto ">
        {/* Navbar content */}
        <div className="flex justify-between items-center mx-10">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <img
              src="/favicon.ico"
              alt="Logo"
              className="h-8 w-8 rounded-full shadow"
            />
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              ABHYAS
            </span>
          </div>

          {/* Hamburger menu for mobile */}
          <div className="block md:hidden">
            <button onClick={toggleMenu} className="md:hidden p-2 transition">
              {menuOpen ? (
                <span className="text-2xl">✕</span> // X icon when menu is open
              ) : (
                <span className="text-2xl">☰</span> // Hamburger icon when menu is closed
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-16 mx-10">
            {username ? (
              <>
                <span className="flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold shadow-md border border-white/30 animate-fade-in">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white/80"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {username}
                </span>
                {/* Notification Bell */}
                <NotificationBell />
                <button
                  onClick={() => router.push("/profile")}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition duration-500 hover:scale-125"
                >
                  Account
                </button>

                <button
                  onClick={() => router.push("/my-purchases")}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition duration-500 hover:scale-125"
                >
                  My Purchases
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push("/auth/register")}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition duration-500 hover:scale-125"
                >
                  Register
                </button>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 transition duration-500 hover:scale-125"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu - only shows when menuOpen is true */}
        {menuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-700 z-50 duration-200 transition-colors">
            <div className="flex flex-col p-4 space-y-3">
              {username ? (
                <div className="flex flex-col space-y-3">
                  <span className="text-gray-700 dark:text-gray-300">
                    Hi, {username}
                  </span>
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setMenuOpen(false);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-left"
                  >
                    Account
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400 hover:underline text-left"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => {
                      router.push("/auth/register");
                      setMenuOpen(false);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-left"
                  >
                    Register
                  </button>
                  <button
                    onClick={() => {
                      router.push("/auth/login");
                      setMenuOpen(false);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-left"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

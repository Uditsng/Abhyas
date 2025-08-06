"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import NotificationBell from "./NotificationBell";
import { FaUser, FaShoppingCart, FaSignOutAlt } from "react-icons/fa";
export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user,role, logout } = useAuth();
  const { mounted } = useTheme();

  const [username, setUsername] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const userStr = localStorage.getItem("mockUser");
      const storedUser = userStr ? JSON.parse(userStr) : null;

      if (storedUser?.name) {
        setUsername(storedUser.name);
      } else if (user?.displayName) {
        setUsername(user.displayName);
      } else if (user?.email) {
        setUsername(user.email.split("@")[0]);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout?.();
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

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  if (!mounted) return null;

  if (/^\/test(\/[^\/]+){1,2}$/.test(pathname)) return null; //regex

  return (
    <nav className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-xl fixed w-full z-50 p-4">
      <div className="container mx-auto">
        {/* Main Bar */}
        <div className="flex justify-between items-center mx-4 md:mx-10">
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

          {/* Mobile Hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            {username && <NotificationBell />}
            <button onClick={toggleMenu} className="block md:hidden p-2">
              <span className="text-2xl">{menuOpen ? "✕" : "☰"}</span>
            </button>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
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
                {(role === "user" || role === "admin") && <NotificationBell />}
                <button
                  onClick={() => router.push("/profile")}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition hover:scale-110"
                >
                  <FaUser />
                </button>
                {role === 'user' && (
                <button
                  onClick={() => router.push("/my-purchases")}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition hover:scale-110"
                >
                  <FaShoppingCart />
                </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push("/auth/register")}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition hover:scale-110"
                >
                  Register
                </button>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 transition hover:scale-110"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>

        {/** Mobile View */}
        {menuOpen && (
          <div className="md:hidden absolute top-16 right-4 w-56 rounded-xl bg-white dark:bg-gray-900 shadow-xl border border-blue-200 dark:border-blue-800 animate-fade-in z-50">
            <div className="flex flex-col py-4 px-3 gap-3 text-gray-700 dark:text-gray-100">
              {username ? (
                <>
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition"
                  >
                    <FaUser className="text-blue-500 dark:text-blue-300" />
                    <span>Account</span>
                  </button>

                  {role === "user" && (
                  <button
                    onClick={() => {
                      router.push("/my-purchases");
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition"
                  >
                    <FaShoppingCart className="text-blue-500 dark:text-blue-300" />
                    <span>My Purchases</span>
                  </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      router.push("/auth/register");
                      setMenuOpen(false);
                    }}
                    className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:underline text-left"
                  >
                    Register
                  </button>
                  <button
                    onClick={() => {
                      router.push("/auth/login");
                      setMenuOpen(false);
                    }}
                    className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:underline text-left"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     if (user) {
  //       //This function gets the user's document from the Firestore database using their unique ID (user.uid).
  //       const userDoc = await getDoc(doc(db, 'users', user.uid));
  //       setUserData(userDoc.exists() ? userDoc.data() : null);
  //     }
  //   };
  //   fetchUserData();
  // }, [user]);

  // useEffect(() => {
  //   if (user && userData) {
  //     // Redirect based on user role
  //     if (userData.role === "superAdmin") {
  //       router.push("/superAdmin");
  //     } else if (userData.role === "admin") {
  //       // if (userData.status === "blocked") {
  //       //   router.push("/login");
  //       // } else {
  //       //   router.push("/admin");
  //       // }
  //       console.log(user)
  //     } else {
  //       router.push("/dashboard");
  //     }
  //   }
  // }, [user, userData, router]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      setIsLoading(false);
      return;
    }

    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;
      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", userId));
      const userData = userDoc.exists() ? userDoc.data() : null;
      // Redirect based on role
      if (userData?.role === "superAdmin") {
        router.push("/superAdmin");
      } else if (userData?.role === "admin") {
        if (userData.status === 'blocked') {
        router.push('/auth/login');
    } else{
      router.push('/admin')
    }
      } else {
        if (userData.status === 'blocked') {
        router.push('/auth/login');
        }else{
            router.push("/dashboard"); 
          }        
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(
        "Login failed: " + (error.message || "Please check your credentials")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg shadow-blue-500/50 dark:shadow-blue-500/50 transition-colors duration-200">
        <h2 className="text-2xl text-center font-bold mb-6 text-blue-500 dark:text-cyan-100">
          Login
        </h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
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
            {isLoading ? "Logging in..." : "Login with Email"}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={async () => {
              try {
                setIsLoading(true);
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                const userId = result.user.uid;
                // Fetch user profile from Firestore
                const userDoc = await getDoc(doc(db, "users", userId));
                const userData = userDoc.exists() ? userDoc.data() : null;
                // Redirect based on role
                if (userData?.role === "superAdmin") {
                  router.push("/superAdmin");
                } else if (userData?.role === "admin") {
                  router.push("/admin");
                } else {
                  router.push("/dashboard");
                }
              } catch (error) {
                console.error("Google sign-in error:", error);
                alert(
                  "Google sign-in failed: " +
                    (error.message || "Please try again")
                );
              } finally {
                setIsLoading(false);
              }
            }}
            className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800
                     text-white py-2 rounded-md transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>

        <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

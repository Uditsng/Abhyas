// app/login/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
} from "firebase/auth";
import Link from "next/link";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("credentials"); // updated - state to manage the form step: 'credentials' or 'otp'
  // const [loading, setLoading] = useState(false); // updated - consolidated loading state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setError("");

    if (!email || !password) {
      setEmailLoading(false);
      setError("Please fill all fields");
      return;
    }

    try {
      // Step 1: Call the send-otp API
      const otpResponse = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!otpResponse.ok) {
        throw new Error("Failed to send OTP. Please try again.");
      }
      console.log(otpResponse.status, await otpResponse.text());
      setStep("otp");
    } catch (err) {
      console.error("OTP send error:", err);
      setError(err.message || "Failed to send OTP.");
    } finally {
      setEmailLoading(false);
    }
  };

  // updated - This new function verifies the OTP and then logs the user in
  const handleLoginWithOtp = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setError("");

    if (!otp) {
      setError("Please enter the OTP.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Verify the OTP
      const verifyResponse = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Invalid or expired OTP.");
      }

      // Step 2: If OTP is correct, proceed with Firebase login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create session
      const idToken = await userCredential.user.getIdToken();
      const createResp = await fetch("/api/sessions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, userAgent: navigator.userAgent }),
        credentials: "include",
      });
      if (!createResp.ok) {
        const err = await createResp
          .json()
          .catch(() => ({ error: "session create failed" }));
        console.error("Session create failed", err);
        await firebaseSignOut(auth);
        setError("Unable to create session. Try again.");
        setEmailLoading(false);
        return;
      }
      const body = await createResp.json();
      localStorage.setItem("abhyas_session_id", body.sessionId);

      // Role-based redirect
      const userId = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, "users", userId));
      const userData = userDoc.exists() ? userDoc.data() : null;

      if (userData?.role === "superAdmin") {
        router.push("/superAdmin");
      } else if (userData?.role === "admin") {
        if (userData.status === "blocked") {
          setError("Your admin account is blocked.");
          return;
        }
        router.push("/admin");
      } else if (userData?.role === "management") {
        router.push("/management/payouts");
      } else {
        if (userData?.status === "blocked") {
          setError("Your account is blocked.");
          return;
        }
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // 🔐 Create session
      const idToken = await result.user.getIdToken();
      const createResp = await fetch("/api/sessions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, userAgent: navigator.userAgent }),
        credentials: "include",
      });
      if (!createResp.ok) {
        const err = await createResp
          .json()
          .catch(() => ({ error: "session create failed" }));
        console.error("Session create failed", err);
        await firebaseSignOut(auth);
        setError("Unable to create session. Try again.");
        return;
      }
      const body = await createResp.json();
      localStorage.setItem("abhyas_session_id", body.sessionId);

      const userId = result.user.uid;
      const userDoc = await getDoc(doc(db, "users", userId));
      const userData = userDoc.exists() ? userDoc.data() : null;

      if (userData?.role === "superAdmin") {
        router.push("/superAdmin");
      } else if (userData?.role === "admin") {
        router.push("/admin");
      } else if (userData?.role === "management") {
        router.push("/management/payouts");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(error.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetMessage("Please enter your email");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("Reset link sent! Check your inbox.");
    } catch (error) {
      setResetMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg shadow-blue-500/50 dark:shadow-cyan-500/50 w-full max-w-md mt-24 mb-8">
        <h2 className="text-2xl text-center font-bold mb-6 text-blue-500 dark:text-cyan-100">
          Login
        </h2>

        {step === "credentials" ? (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white py-2 rounded-2xl p-3 hover:bg-blue-700 ${
                emailLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={emailLoading}
            >
              {emailLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          // updated - This is the new OTP form that shows up in the second step
          <form onSubmit={handleLoginWithOtp}>
            <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
              An OTP has been sent to {email}.
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-2xl mb-4 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            {error && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white py-2 rounded-2xl p-3 hover:bg-blue-700 ${
                emailLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={emailLoading}
            >
              {emailLoading ? "Verifying..." : "Login"}
            </button>
            <button
              type="button"
              onClick={() => setStep("credentials")}
              className="w-full text-center text-blue-600 dark:text-blue-400 mt-2 hover:underline"
            >
              Back to Login
            </button>
          </form>
        )}

        <button
          onClick={handleGoogleLogin}
          className={`w-full bg-red-600 text-white py-2 rounded-2xl p-3 hover:bg-red-700 mt-4 ${
            googleLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={googleLoading}
        >
          {googleLoading ? "Signing in..." : "Sign in with Google"}
        </button>

        <div className="flex justify-between items-center text-sm mt-4">
          <p className="text-gray-700 dark:text-gray-300">
            Don’t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Register
            </Link>
          </p>
          <button
            className="text-blue-600 dark:text-blue-400 hover:underline"
            onClick={() => setShowReset(true)}
          >
            Forgot password?
          </button>
        </div>
      </div>

      {/* Reset Password Modal */}
      <Dialog
        open={showReset}
        onClose={() => setShowReset(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <DialogPanel className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-sm w-full">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Reset Password
            </DialogTitle>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg mb-3 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            {resetMessage && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                {resetMessage}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                onClick={handlePasswordReset}
              >
                Send Reset Link
              </button>
              <button
                className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 py-2 px-4 rounded-lg"
                onClick={() => setShowReset(false)}
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}

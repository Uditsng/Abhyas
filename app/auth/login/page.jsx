// //login/page.jsx
// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//   signInWithEmailAndPassword,
//   GoogleAuthProvider,
//   signInWithPopup,
//   sendPasswordResetEmail,
// } from "firebase/auth";
// import { auth, db } from "@/lib/firebaseConfig";
// import Link from "next/link";
// import { useAuth } from "@/components/AuthContext";
// import { doc, getDoc } from "firebase/firestore";
// import {
//   Box,
//   Flex,
//   Text,
//   Input,
//   Button,
//   useDisclosure,
//   useToast,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
// } from "@chakra-ui/react";

// export default function LoginPage() {
//   const router = useRouter();
//   const { user } = useAuth();
//   const toast = useToast();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [emailLoading, setEmailLoading] = useState(false);
//   const [googleLoading, setGoogleLoading] = useState(false)
//   const [resetEmail, setResetEmail] = useState("");

//   const {
//     isOpen: isResetOpen,
//     onOpen: openReset,
//     onClose: closeReset,
//   } = useDisclosure();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setEmailLoading(true);

//     if (!email || !password) {
//       setEmailLoading(false);
//       toast({
//         title: "Please fill all fields",
//         status: "warning",
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       // Sign in with email and password
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const userId = userCredential.user.uid;
//       // Fetch user profile from Firestore
//       const userDoc = await getDoc(doc(db, "users", userId));
//       const userData = userDoc.exists() ? userDoc.data() : null;
//       // Redirect based on role
//       if (userData?.role === "superAdmin") {
//         router.push("/superAdmin");
//       } else if (userData?.role === "admin") {
//         if (userData.status === "blocked") {
//           toast({
//             title: "Your admin account is blocked.",
//             status: "error",
//             isClosable: true,
//           });
//           router.push("/auth/login");
//         } else {
//           router.push("/admin");
//         }
//       } else {
//         if (userData.status === "blocked") {
//           toast({
//             title: "Your account is blocked.",
//             status: "error",
//             isClosable: true,
//           });
//           router.push("/auth/login");
//         } else {
//           router.push("/dashboard");
//         }
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//             toast({
//         title: "Login failed",
//         description: error.message || "Please check your credentials.",
//         status: "error",
//         isClosable: true,
//       });
//     } finally {
//       setEmailLoading(false);
//     }
//   };

//   const handlePasswordReset = async () => {
//     if (!resetEmail) {
//       toast({
//         title: " Please enter your email. ",
//         status: "warning",
//         isClosable: true,
//       })
//       return;
//     }
//     try {
//       await sendPasswordResetEmail(auth, resetEmail);
//       toast({
//         title: "Reset link sent",
//         description:" If your email exists, a reset link has been sent to your inbox",
//         status: "success",
//         isClosable: true,
//       })      
//       setResetEmail("");
//       closeReset();
//     } catch (error) {
//       toast({
//         title: "Error sending reset email",
//         description: error.message,
//         status: "error",
//         isClosable: true,
//       });
//     }
//   };

//   const handleGoogleLogin = async () =>{
//     try{
//       setGoogleLoading(true);
//       const provider = new GoogleAuthProvider()
//       const result = await signInWithPopup(auth, provider)
//       const userId = result.user.uid;
//       const userDoc = await getDoc(doc(db, "users", userId))
//       const userData = userDoc.exists() ? userDoc.data() : null;

//       if (userData?.role === "superAdmin"){
//         router.push("/superAdmin");
//       }else if(userData?.role === "admin"){
//         router.push("/admin")
//       } else {
//         router.push("/dashboard")
//       }
//     } catch (error){
//       console.error("Google sign-in error:", error);
//       toast({
//         title: "Google sign-in failed",
//         description: error.message || "Please try again",
//         status:"error",
//         isClosable: true,
//       })
//     } finally{
//       setGoogleLoading(false);
//     }
//   }

//   return (
//  <Flex
//       minH="100vh"
//       align="center"
//       justify="center"
//       bg="gray.50"
//       _dark={{ bg: "gray.900" }}
//       px={4}
//     >
//       <Box
//         bg="white"
//         _dark={{ bg: "gray.800" }}
//         p={6}
//         rounded="lg"
//         shadow="lg"
//         w="full"
//         maxW="md"
//       >
//         <Text
//           fontSize="2xl"
//           fontWeight="bold"
//           textAlign="center"
//           color="blue.500"
//           _dark={{ color: "cyan.100" }}
//           mb={6}
//         >
//           Login
//         </Text>



//         <form onSubmit={handleLogin}>
//           <Input
//             type="email"
//             placeholder="Email"
//             mb={4}
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <Input
//             type="password"
//             placeholder="Password"
//             mb={4}
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <Button
//             type="submit" 
//             colorScheme="blue"   
//             w="full"                
//             isLoading={emailLoading}
//             mb={4}
//           >
//           Login with Email
//           </Button>
//         </form>

//           <Button
//           onClick={handleGoogleLogin}
//           colorScheme="red"
//           w="full"
//           isLoading={googleLoading}
//           mb={4}
//         >
//           Sign in with Google
//         </Button>

//         <Flex justify="space-between" align="center" fontSize="sm" mb={2}>
//           <Text color="gray.600" _dark={{ color: "gray.400" }}>
//             Don't have an account?{" "}
//             <Link
//               href="/auth/register"
//               className="text-blue-600 dark:text-blue-400 hover:underline"
//             >
//               Register
//             </Link>
//           </Text>
//           <Button variant="link" colorScheme="blue" onClick={openReset}>
//             Forgot password?
//           </Button>
//         </Flex>
//       </Box>

//       {/** Reset Password Modal */}
//       <Modal isOpen={isResetOpen} onClose={closeReset} isCentered>
//         <ModalOverlay>
//           <ModalContent>
//             <ModalHeader>Reset Password</ModalHeader>
//             <ModalCloseButton/>
//             <ModalBody>
//               <Input
//                 type="email"
//                 placeholder="Enter your email"
//                 value={resetEmail}
//                 onChange={(e) => setResetEmail(e.target.value)}
//                 required
//               />
//             </ModalBody>
//             <ModalFooter>
//               <Button colorScheme="blue" mr={3} onClick={handlePasswordReset}>
//                 Send Email
//               </Button>
//               <Button onClick={closeReset}>Cancel</Button>
//             </ModalFooter>
//           </ModalContent>
//         </ModalOverlay>
//       </Modal>
//     </Flex>
//   );
// }

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import { auth, db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/components/AuthContext';
import { Dialog } from '@headlessui/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setError('');
    if (!email || !password) {
      setEmailLoading(false);
      setError('Please fill all fields');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : null;

      if (userData?.role === 'superAdmin') {
        router.push('/superAdmin');
      } else if (userData?.role === 'admin') {
        if (userData.status === 'blocked') {
          setError('Your admin account is blocked.');
          return;
        }
        router.push('/admin');
      } else {
        if (userData?.status === 'blocked') {
          setError('Your account is blocked.');
          return;
        }
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userId = result.user.uid;
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : null;

      if (userData?.role === 'superAdmin') {
        router.push('/superAdmin');
      } else if (userData?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetMessage('Please enter your email');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Reset link sent! Check your inbox.');
    } catch (error) {
      setResetMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg shadow-blue-500/50 dark:shadow-cyan-500/50 w-full max-w-md mt-24 mb-8">
        <h2 className="text-2xl text-center font-bold mb-6 text-blue-500 dark:text-cyan-100">Login</h2>

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
          {error && <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">{error}</div>}
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded-2xl p-3 hover:bg-blue-700 ${emailLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={emailLoading}
          >
            {emailLoading ? 'Logging in...' : 'Login with Email'}
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          className={`w-full bg-red-600 text-white py-2 rounded-2xl p-3 hover:bg-red-700 mt-4 ${googleLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={googleLoading}
        >
          {googleLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <div className="flex justify-between items-center text-sm mt-4">
          <p className="text-gray-700 dark:text-gray-300">
            Don’t have an account?{' '}
            <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 hover:underline">
              Register
            </Link>
          </p>
          <button className="text-blue-600 dark:text-blue-400 hover:underline" onClick={() => setShowReset(true)}>
            Forgot password?
          </button>
        </div>
      </div>

      {/* Reset Password Modal */}
      <Dialog open={showReset} onClose={() => setShowReset(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <Dialog.Panel className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-sm w-full">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Reset Password</Dialog.Title>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg mb-3 p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            {resetMessage && <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">{resetMessage}</p>}
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
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

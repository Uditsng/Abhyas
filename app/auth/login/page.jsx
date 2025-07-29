"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false)
  const [resetEmail, setResetEmail] = useState("");

  const {
    isOpen: isResetOpen,
    onOpen: openReset,
    onClose: closeReset,
  } = useDisclosure();

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailLoading(true);

    if (!email || !password) {
      setEmailLoading(false);
      toast({
        title: "Please fill all fields",
        status: "warning",
        isClosable: true,
      });
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
        if (userData.status === "blocked") {
          toast({
            title: "Your admin account is blocked.",
            status: "error",
            isClosable: true,
          });
          router.push("/auth/login");
        } else {
          router.push("/admin");
        }
      } else {
        if (userData.status === "blocked") {
          toast({
            title: "Your account is blocked.",
            status: "error",
            isClosable: true,
          });
          router.push("/auth/login");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
            toast({
        title: "Login failed",
        description: error.message || "Please check your credentials.",
        status: "error",
        isClosable: true,
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        title: " Please enter your email. ",
        status: "warning",
        isClosable: true,
      })
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: "Reset link sent",
        description:" If your email exists, a reset link has been sent to your inbox",
        status: "success",
        isClosable: true,
      })      
      setResetEmail("");
      closeReset();
    } catch (error) {
      toast({
        title: "Error sending reset email",
        description: error.message,
        status: "error",
        isClosable: true,
      });
    }
  };

  const handleGoogleLogin = async () =>{
    try{
      setGoogleLoading(true);
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const userId = result.user.uid;
      const userDoc = await getDoc(doc(db, "users", userId))
      const userData = userDoc.exists() ? userDoc.data() : null;

      if (userData?.role === "superAdmin"){
        router.push("/superAdmin");
      }else if(userData?.role === "admin"){
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (error){
      console.error("Google sign-in error:", error);
      toast({
        title: "Google sign-in failed",
        description: error.message || "Please try again",
        status:"error",
        isClosable: true,
      })
    } finally{
      setGoogleLoading(false);
    }
  }

  return (
 <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="gray.50"
      _dark={{ bg: "gray.900" }}
      px={4}
    >
      <Box
        bg="white"
        _dark={{ bg: "gray.800" }}
        p={6}
        rounded="lg"
        shadow="lg"
        w="full"
        maxW="md"
      >
        <Text
          fontSize="2xl"
          fontWeight="bold"
          textAlign="center"
          color="blue.500"
          _dark={{ color: "cyan.100" }}
          mb={6}
        >
          Login
        </Text>



        <form onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Email"
            mb={4}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            mb={4}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit" 
            colorScheme="blue"   
            w="full"                
            isLoading={emailLoading}
            mb={4}
          >
          Login with Email
          </Button>
        </form>

          <Button
          onClick={handleGoogleLogin}
          colorScheme="red"
          w="full"
          isLoading={googleLoading}
          mb={4}
        >
          Sign in with Google
        </Button>

        <Flex justify="space-between" align="center" fontSize="sm" mb={2}>
          <Text color="gray.600" _dark={{ color: "gray.400" }}>
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Register
            </Link>
          </Text>
          <Button variant="link" colorScheme="blue" onClick={openReset}>
            Forgot password?
          </Button>
        </Flex>
      </Box>

      {/** Reset Password Modal */}
      <Modal isOpen={isResetOpen} onClose={closeReset} isCentered>
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>Reset Password</ModalHeader>
            <ModalCloseButton/>
            <ModalBody>
              <Input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handlePasswordReset}>
                Send Email
              </Button>
              <Button onClick={closeReset}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </Flex>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Container,
  Heading,
  Text,
  useToast,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

export default function changePasswordPages() {
  const router = useRouter();
  const toast = useToast();
  const [user, loading] = useAuthState(auth);

  //form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  //UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  //validation
  const passwordsMatch = newPassword === confirmPassword;
  const isPasswordStrong = newPassword.length >= 8;

  //Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    //basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (!passwordsMatch) {
      setError("New passwords don't match");
      return;
    }

    if (!isPasswordStrong) {
      setError("New password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      //For mock users, just show success
      if (localStorage.getItem("mockUser")) {
        toast({
          title: "Password Changed",
          description: "Password changed successfully",
          status: "success",
          duration: 3000,
        });
        router.push("/profile");
        return;
      }

      //For real users, update password in firebase auth
      if (user) {
        //1st re-authenticate the user
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );

        await reauthenticateWithCredential(user, credential);

        // then update the password
        await updatePassword(user, newPassword);

        toast({
          title: "Password Changed",
          description: "Password changed successfully",
          status: "success",
          duration: 3000,
        });
        router.push("/profile");
      }
    } catch (err) {
      console.error("Error changing password:", err);

      // Handle specific Firebase errors
      if (err.code === "auth/wrong-password") {
        setError("Current password is incorrect");
      } else if (err.code === "auth/weak-password") {
        setError("New password is too weak");
      } else {
        setError("Failed to change password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // redirect if not logged in
  if (!loading && !user && !localStorage.getItem("mockUser")) {
    router.push("/auth/login");
    return null;
  }

  return (
    <Container maxW="container.sm" py={10} className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Box
        bg="white"
        _dark={{ bg: "gray.800" }}
        shadow="md"
        borderRadius="lg"
        overflow="hidden"
        transition="all 0.2s"
      >
        <Box
          bg="yellow.500"
          _dark={{ bg: "yellow.600" }}
          p={6}
          color="white"
          transition="all 0.2s"
        >
          <Heading size="lg">Change Password</Heading>
          <Text color="yellow.50">Update your account password</Text>
        </Box>

        <Box p={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              {/** Current Password */}
              <FormControl isRequired>
                <FormLabel color="gray.700" _dark={{ color: "gray.300" }}>Current Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    bg="white"
                    color="gray.800"
                    borderColor="gray.300"
                    _dark={{
                      bg: "gray.700",
                      color: "gray.100",
                      borderColor: "gray.600"
                    }}
                  />

                  <InputRightElement>
                    <IconButton
                      icon={
                        showCurrentPassword ? <ViewIcon /> : <ViewOffIcon />
                      }
                      variant="ghost"
                      color="gray.600"
                      _dark={{ color: "gray.400" }}
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      aria-label={
                        showCurrentPassword ? "Hide password" : "Show password"
                      }
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {/** New Password */}
              <FormControl
                isRequired
                isInvalid={!passwordsMatch || !isPasswordStrong}
              >
                <FormLabel color="gray.700" _dark={{ color: "gray.300" }}>New Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    bg="white"
                    color="gray.800"
                    borderColor="gray.300"
                    _dark={{
                      bg: "gray.700",
                      color: "gray.100",
                      borderColor: "gray.600"
                    }}
                  />

                  <InputRightElement>
                    <IconButton
                      icon={showNewPassword ? <ViewIcon /> : <ViewOffIcon />}
                      variant="ghost"
                      color="gray.600"
                      _dark={{ color: "gray.400" }}
                      onClick={() => {
                        setShowNewPassword(!showNewPassword);
                      }}
                      aria-label={
                        showNewPassword ? "Hide password" : "Show password"
                      }
                    />
                  </InputRightElement>
                </InputGroup>
                {newPassword && !isPasswordStrong && (
                  <FormErrorMessage>
                    Password must be at least 8 characters
                  </FormErrorMessage>
                )}
              </FormControl>

              {/* Confirm Password */}
              <FormControl
                isRequired
                isInvalid={confirmPassword && !passwordsMatch}
              >
                <FormLabel color="gray.700" _dark={{ color: "gray.300" }}>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  bg="white"
                  color="gray.800"
                  borderColor="gray.300"
                  _dark={{
                    bg: "gray.700",
                    color: "gray.100",
                    borderColor: "gray.600"
                  }}
                />
                {confirmPassword && !passwordsMatch && (
                  <FormErrorMessage>Passwords don't match</FormErrorMessage>
                )}
              </FormControl>

              {/* Error message */}
              {error && (
                <Box
                  p={3}
                  bg="red.50"
                  color="red.500"
                  borderRadius="md"
                  _dark={{
                    bg: "red.900",
                    color: "red.300"
                  }}
                >
                  {error}
                </Box>
              )}

              {/* Action Buttons */}
              <Box pt={2} display="flex" justifyContent="space-between">
                <Button
                  variant="outline"
                  borderColor="gray.300"
                  color="gray.700"
                  _hover={{ bg: "gray.100" }}
                  _dark={{
                    borderColor: "gray.600",
                    color: "gray.300",
                    _hover: { bg: "gray.700" }
                  }}
                  onClick={() => router.push("/profile")}
                >
                  Cancel
                </Button>

                <Button
                  colorScheme="yellow"
                  _dark={{ bg: "yellow.600", _hover: { bg: "yellow.700" } }}
                  type="submit"
                  isLoading={isSubmitting}
                >
                  Update Password
                </Button>
              </Box>
            </VStack>
          </form>
        </Box>
      </Box>
    </Container>
  );
}

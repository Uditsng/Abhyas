"use client";

//Profile & Settings: profile-page.jsx and change-password-page.jsx handle user profile and password changes.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import { useForm } from "react-hook-form";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocument } from "react-firebase-hooks/firestore";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Avatar,
  Flex,
  Text,
  Heading,
  VStack,
  HStack,
  Container,
  useToast,
  Spinner,
  FormErrorMessage,
  Divider,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [authUser, authLoading] = useAuthState(auth);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  //Get User Docs from firestore
  const [profileSnapshot, profileLoading] = useDocument(
    authUser ? doc(db, "users", authUser.uid) : null
  );

  //Raect hook form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  //set form values when profile data is loaded
  useEffect(() => {
    // Check for mock user first
    const mockUserStr = localStorage.getItem("mockUser");
    if (mockUserStr) {
      try {
        const mockUser = JSON.parse(mockUserStr);
        setValue("displayName", mockUser.name || "");
        setValue("email", mockUser.email || "");
        setValue("phone", mockUser.phone || "");
        setValue("address", mockUser.address || "");
        setImagePreview(mockUser.photoURL || null);
        console.log("Loaded mock user data:", mockUser);
        return; // Exit early if mock user is found
      } catch (error) {
        console.error("Error parsing mock user:", error);
      }
    }

    // If no mock user, use auth user data
    if (authUser) {
      setValue("displayName", authUser.displayName || "");
      setValue("email", authUser.email || "");
    }

    if (profileSnapshot && profileSnapshot.exists()) {
      const data = profileSnapshot.data();
      setValue("phone", data.phone || "");
      setValue("address", data.address || "");
      setImagePreview(data.photoURL || authUser?.photoURL || null);
    }
  }, [authUser, profileSnapshot, setValue]);

  //Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !authUser && !localStorage.getItem("mockUser")) {
      router.push("/auth/login");
    }
  }, [authUser, authLoading, router]);

  //Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);

      //create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to firebase storage
  const upLoadImage = async (userId) => {
    if (!profileImage) return null;

    try {
      setIsUploading(true);
      const storageRef = ref(storage, `profile_pictures/${userId}`);
      await uploadBytes(storageRef, profileImage);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "upload failed",
        description: "could not upload profile picture",
        status: "error",
        duration: 3000,
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // handle form submission
  const onSubmit = async (data) => {
    try {
      if (!authUser && !localStorage.getItem("mockUser")) {
        toast({
          title: "Not logged in",
          description: "Please log in to update your profile",
          status: "error",
          duration: 3000,
        });
        return;
      }

      //upload profile image if selected
      let photoURL = null;
      if (profileImage) {
        photoURL = await upLoadImage(authUser.uid);
      }

      if (authUser) {
        //update firebase auth profile
        await updateProfile(authUser, {
          displayName: data.displayName,
          ...(photoURL && { photoURL }),
        });

        //Update firestore document
        await setDoc(
          doc(db, "users", authUser.uid),
          {
            name: data.displayName,
            email: data.email,
            phone: data.phone || "",
            address: data.address || "",
            ...(photoURL && { photoURL }),
            updateAt: new Date(),
          },
          { merge: true }
        );
      }

      //update local storage for mock user
      if (localStorage.getItem("mockUser")) {
        const mockUser = JSON.parse(localStorage.getItem("mockUser"));
        localStorage.setItem(
          "mockUser",
          JSON.stringify({
            ...mockUser,
            name: data.displayName,
            phone: data.phone,
            address: data.address,
            photoURL: photoURL || imagePreview,
          })
        );
      }

      toast({
        title: "profile updated",
        description: " Your profile has been updated successfully",
        status: "success",
        duration: 3000,
      });

      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Update failed",
        description: "Could not update your profile",
        status: "error",
        duration: 3000,
      });
    }
  };

  if(authLoading || profileLoading){
    return (
        <Flex height="100vh" align="center" justify="center">
            <Spinner size="xl" color="blue.500"/>
        </Flex>
    )
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Box maxW="3xl" mx="auto">
        <Heading as="h1" size="xl" mb={6} className="text-gray-900 dark:text-gray-100">
          Your Profile
        </Heading>

        <Box bg="white" _dark={{ bg: "gray.800" }} rounded="lg" shadow="md" p={6} mb={6} className="transition-colors duration-200">
          <Flex direction={{ base: "column", sm: "row" }} align={{ base: "center", sm: "flex-start" }} mb={6}>
            <Box position="relative" w={{ base: "24", sm: "32" }} h={{ base: "24", sm: "32" }} mb={{ base: 4, sm: 0 }} mr={{ sm: 6 }}>
              {imagePreview ? (
                <Avatar
                  size="full"
                  src={imagePreview}
                  alt="Profile"
                />
              ) : (
                <Avatar
                  size="full"
                  bg="gray.200"
                  _dark={{ bg: "gray.700" }}
                  icon={<EditIcon fontSize="1.5rem" color="gray.400" />}
                />
              )}

              <Box position="absolute" bottom="0" right="0" bg="blue.600" _dark={{ bg: "blue.700" }} color="white" p={2} borderRadius="full" cursor="pointer">
                <EditIcon w={4} h={4} />
                <Input
                  type="file"
                  display="none"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Box>
            </Box>

            <Box textAlign={{ base: "center", sm: "left" }}>
              <Heading as="h2" size="md" color="gray.900" _dark={{ color: "gray.100" }}>
                {authUser?.displayName || (localStorage.getItem("mockUser") && JSON.parse(localStorage.getItem("mockUser")).name) || 'User'}
              </Heading>
              <Text color="gray.600" _dark={{ color: "gray.400" }}>
                {authUser?.email || (localStorage.getItem("mockUser") && JSON.parse(localStorage.getItem("mockUser")).email) || 'user@example.com'}
              </Text>

              <HStack mt={3} justify={{ base: "center", sm: "flex-start" }} spacing={2} flexWrap="wrap">
                <Button
                  size="sm"
                  bg="gray.200"
                  color="gray.800"
                  _hover={{ bg: "gray.300" }}
                  _dark={{
                    bg: "gray.700",
                    color: "gray.200",
                    _hover: { bg: "gray.600" }
                  }}
                  onClick={() => router.push("/change-password")}
                >
                  Change Password
                </Button>

                <Button
                  size="sm"
                  bg="red.100"
                  color="red.800"
                  _hover={{ bg: "red.200" }}
                  _dark={{
                    bg: "red.900",
                    color: "red.200",
                    _hover: { bg: "red.800" }
                  }}
                  onClick={() => {
                    auth.signOut();
                    router.push("/auth/login");
                  }}
                >
                  Logout
                </Button>
              </HStack>
            </Box>
          </Flex>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction={{ base: "column", sm: "row" }} gap={4} mb={4}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: "gray.300" }}>
                  Phone Number
                </FormLabel>
                <Input
                  type="tel"
                  placeholder="Your phone number"
                  {...register("phone")}
                  bg="white"
                  color="gray.900"
                  _dark={{
                    bg: "gray.700",
                    color: "gray.100"
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: "gray.300" }}>
                  Address
                </FormLabel>
                <Input
                  type="text"
                  placeholder="Your address"
                  {...register("address")}
                  bg="white"
                  color="gray.900"
                  _dark={{
                    bg: "gray.700",
                    color: "gray.100"
                  }}
                />
              </FormControl>
            </Flex>

            <Button
              type="submit"
              w="full"
              bg="blue.600"
              _hover={{ bg: "blue.700" }}
              color="white"
              _dark={{
                bg: "blue.700",
                _hover: { bg: "blue.800" }
              }}
              isLoading={isSubmitting}
              loadingText="Saving..."
            >
              Save Profile
            </Button>
          </form>

          <Divider my={6} />

          {/* Account Actions */}
          <Box>
            <Heading size="md" mb={4}>Account Actions</Heading>
            <VStack spacing={3}>
              <Button
                w="full"
                onClick={() => router.push("/dashboard")}
                variant="outline"
              >
                Go to Dashboard
              </Button>
              <Button
                w="full"
                onClick={() => router.push("/change-password")}
                colorScheme="yellow"
                variant="solid"
              >
                Change Password
              </Button>
            </VStack>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}

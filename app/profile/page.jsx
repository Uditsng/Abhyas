"use client";

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
  IconButton,
} from "@chakra-ui/react";

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
    <Container maxW="container.md" py={10}>
      <Box bg="white" shadow="md" borderRadius="lg" overflow="hidden">
        <Box bg="blue.600" p={6} color="white">
          <Heading size="lg">User Profile</Heading>
          <Text color="blue.100">Manage your account information</Text>
        </Box>

        <Box p={6}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Profile Picture */}
            <Flex direction="column" align="center" mb={6}>
              <Avatar
                size="2xl"
                src={imagePreview}
                mb={4}
                name={localStorage.getItem("mockUser")
                  ? JSON.parse(localStorage.getItem("mockUser")).name
                  : authUser?.displayName || "User"}
              />
              {isEditing && (
                <FormControl>
                  <FormLabel
                    htmlFor="profile-image"
                    cursor="pointer"
                    bg="blue.50"
                    color="blue.600"
                    px={3}
                    py={1}
                    borderRadius="md"
                    _hover={{ bg: "blue.100" }}
                  >
                    Change Photo
                  </FormLabel>
                  <Input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    display="none"
                  />
                </FormControl>
              )}
            </Flex>

            <VStack spacing={4} align="stretch">
              {/* Display Name */}
              <FormControl isInvalid={errors.displayName}>
                <FormLabel>Display Name</FormLabel>
                {isEditing ? (
                  <>
                    <Input
                      {...register("displayName", {
                        required: "Name is required"
                      })}
                    />
                    <FormErrorMessage>
                      {errors.displayName && errors.displayName.message}
                    </FormErrorMessage>
                  </>
                ) : (
                  <Box p={2} bg="gray.50" borderRadius="md">
                    {localStorage.getItem("mockUser")
                      ? JSON.parse(localStorage.getItem("mockUser")).name
                      : authUser?.displayName || "Not set"}
                  </Box>
                )}
              </FormControl>

              {/* Email */}
              <FormControl>
                <FormLabel>Email Address</FormLabel>
                <Box p={2} bg="gray.50" borderRadius="md">
                  {localStorage.getItem("mockUser")
                    ? JSON.parse(localStorage.getItem("mockUser")).email
                    : authUser?.email || "Not available"}
                </Box>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Email cannot be changed
                </Text>
              </FormControl>

              {/* Phone Number */}
              <FormControl isInvalid={errors.phone}>
                <FormLabel>Phone Number</FormLabel>
                {isEditing ? (
                  <>
                    <Input
                      {...register("phone", {
                        pattern: {
                          value: /^\+?[0-9]{10,15}$/,
                          message: "Please enter a valid phone number"
                        }
                      })}
                    />
                    <FormErrorMessage>
                      {errors.phone && errors.phone.message}
                    </FormErrorMessage>
                  </>
                ) : (
                  <Box p={2} bg="gray.50" borderRadius="md">
                    {localStorage.getItem("mockUser")
                      ? JSON.parse(localStorage.getItem("mockUser")).phone
                      : profileSnapshot?.data()?.phone || "Not provided"}
                  </Box>
                )}
              </FormControl>

              {/* Address */}
              <FormControl>
                <FormLabel>Address</FormLabel>
                {isEditing ? (
                  <Textarea
                    {...register("address")}
                    rows={3}
                  />
                ) : (
                  <Box p={2} bg="gray.50" borderRadius="md">
                    {localStorage.getItem("mockUser")
                      ? JSON.parse(localStorage.getItem("mockUser")).address
                      : profileSnapshot?.data()?.address || "Not provided"}
                  </Box>
                )}
              </FormControl>

              {/* Action Buttons */}
              <HStack justify="end" mt={4}>
                {isEditing ? (
                  <>
                    <HStack spacing={4}>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>

                      <Button
                        colorScheme="blue"
                        type="submit"
                        isLoading={isSubmitting || isUploading}
                      >
                        Save Changes
                      </Button>
                    </HStack>
                  </>
                ) : (
                  <Button
                    colorScheme="blue"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </HStack>
            </VStack>
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

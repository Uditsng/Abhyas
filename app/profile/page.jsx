"use client";

//Profile & Settings: profile-page.jsx and change-password-page.jsx handle user profile and password changes.

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebaseConfig";
import { useForm } from "react-hook-form";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocument } from "react-firebase-hooks/firestore";
import { Box, Button, FormControl, FormLabel, Input, Avatar, Flex, Text, Heading, VStack, HStack, Container, useToast, Spinner, Divider,
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

  // Add a ref for the file input
  const fileInputRef = useRef();

  //set form values when profile data is loaded
  useEffect(() => {
    // Use only authUser and Firestore profile data
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
    if (!authLoading && !authUser) {
      router.push("/auth/login");
    }
  }, [authUser, authLoading, router]);

  //Handle image selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file && authUser) {
      setProfileImage(file);
      setIsUploading(true);
      try {
        // Upload to Firebase Storage
        const storageRef = ref(storage, `profile_pictures/${authUser.uid}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        // Update Firestore user document with new photoURL
        await setDoc(
          doc(db, "users", authUser.uid),
          { photoURL: downloadURL, updateAt: new Date() },
          { merge: true }
        );
        // Update Firebase Auth profile
        await updateProfile(authUser, { photoURL: downloadURL });
        setImagePreview(downloadURL);
        toast({
          title: "Profile picture updated!",
          status: "success",
          duration: 2000,
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "Upload failed",
          description: "Could not upload profile picture",
          status: "error",
          duration: 3000,
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  // handle form submission
  const onSubmit = async (data) => {
    try {
      if (!authUser) {
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
    <Box p={6}>
      <div className="container mx-auto px-4 pt-20 bg-gray-100 dark:bg-gray-900 min-h-screen pb-12 transition-colors duration-200">
        <Container maxW="container.md" py={8}>
          <Box>
            <Flex direction={{ base: "column", sm: "row" }} gap={6}>
              <Box position="relative" w={{ base: "24", sm: "32" }} h={{ base: "24", sm: "32" }} mb={{ base: 4, sm: 0 }} mr={{ sm: 6 }}>
                <Box
                  as="button"
                  type="button"
                  position="absolute"
                  top={0}
                  left={0}
                  w="full"
                  h="full"
                  zIndex={2}
                  bg="transparent"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  cursor="pointer"
                  borderRadius="full"
                  _focus={{ outline: '2px solid #3182ce' }}
                >
                  {isUploading && (
                    <Flex align="center" justify="center" w="full" h="full" position="absolute" top={0} left={0} bg="rgba(255,255,255,0.7)" zIndex={3} borderRadius="full">
                      <Spinner size="lg" color="blue.500" />
                    </Flex>
                  )}
                  {imagePreview ? (
                    <Avatar size="full" src={imagePreview} alt="Profile" />
                  ) : (
                    <Avatar size="full" bg="gray.200" _dark={{ bg: "gray.700" }} icon={<EditIcon fontSize="1.5rem" color="gray.400" />} />
                  )}
                </Box>
                <Input
                  ref={fileInputRef}
                  type="file"
                  display="none"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Box>

              <Box textAlign={{ base: "center", sm: "left" }}>
                <Heading as="h2" size="md" color="gray.900" _dark={{ color: "gray.100" }}>
                  {profileSnapshot?.data()?.name || authUser?.displayName || 'User'}
                </Heading>
                <Text color="gray.600" _dark={{ color: "gray.400" }}>
                  {profileSnapshot?.data()?.email || authUser?.email || 'user@example.com'}
                </Text>

                <HStack mt={3} justify={{ base: "center", sm: "flex-start" }} spacing={2} flexWrap="wrap">
                  <Button
                    size="sm"
                    bg="blue.100"
                    color="blue.800"
                    _hover={{ bg: "blue.200" }}
                    _dark={{
                      bg: "blue.900",
                      color: "blue.200",
                      _hover: { bg: "blue.800" }
                    }}
                    onClick={() => router.push("/subscription")}
                  >
                    View Subscription
                  </Button>

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
              </VStack>
            </Box>
          </Box>
        </Container>
      </div>
    </Box>
  )
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import { useForm } from "react-hook-form";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocument } from "react-firebase-hooks/firestore";
import {
  Box, Button, FormControl, FormLabel, Input, Avatar, Flex,
  Text, Heading, VStack, HStack, Container, useToast, Spinner, Divider
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [authUser, authLoading] = useAuthState(auth);
  const [isUploading, setIsUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();

  const [profileSnapshot, profileLoading] = useDocument(
    authUser ? doc(db, "users", authUser.uid) : null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/auth/login");
    }
  }, [authUser, authLoading, router]);

  useEffect(() => {
    if (authUser) {
      setValue("displayName", authUser.displayName || "");
      setValue("email", authUser.email || "");
    }
    if (profileSnapshot?.exists()) {
      const data = profileSnapshot.data();
      setValue("phone", data.phone || "");
      setValue("address", data.address || "");
      setImagePreview(data.photoURL || authUser?.photoURL || null);
    }
  }, [authUser, profileSnapshot, setValue]);

  const uploadImage = async (uid, file) => {
    const storageRef = ref(storage, `profile_pictures/${uid}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file || !authUser) return;

  if (file.size > 2 * 1024 * 1024) {
    toast({
      title: "File too large",
      description: "Max allowed size is 2MB.",
      status: "warning",
    });
    return;
  }

  setIsUploading(true);
  try {
    const imageURL = await uploadToCloudinary(file);

    await updateProfile(authUser, { photoURL: imageURL });
    await setDoc(doc(db, "users", authUser.uid), {
      photoURL: imageURL,
      updateAt: new Date(),
    }, { merge: true });

    setImagePreview(imageURL);
    toast({ title: "Profile picture updated!", status: "success", duration: 2000 });
  } catch (err) {
    console.error("Upload failed:", err);
    toast({ title: "Upload failed", status: "error", duration: 3000 });
  } finally {
    setIsUploading(false);
  }
};

  const onSubmit = async (data) => {
    try {
      let photoURL = imagePreview;
      if (profileImage) {
        photoURL = await uploadImage(authUser.uid, profileImage);
      }

      await updateProfile(authUser, {
        displayName: data.displayName,
        ...(photoURL && { photoURL })
      });

      await setDoc(doc(db, "users", authUser.uid), {
        name: data.displayName,
        email: data.email,
        phone: data.phone || "",
        address: data.address || "",
        ...(photoURL && { photoURL }),
        updateAt: new Date(),
      }, { merge: true });

      toast({ title: "Profile updated", status: "success", duration: 3000 });
    } catch (error) {
      console.error("Update failed:", error);
      toast({ title: "Update failed", status: "error", duration: 3000 });
    }
  };

  if (authLoading || profileLoading) {
    return <Flex h="100vh" align="center" justify="center"><Spinner size="xl" /></Flex>;
  }

  return (
    <Box p={6} pt={16}>
      <Container maxW="container.md" py={8}>
        <Flex direction={{ base: "column", sm: "row" }} gap={6}>
          <Box position="relative">
            <Box
              as="button"
              onClick={() => fileInputRef.current.click()}
              w={{ base: "24", sm: "32" }} h={{ base: "24", sm: "32" }}
              borderRadius="full" overflow="hidden"
            >
              {isUploading ? (
                <Flex align="center" justify="center" w="full" h="full">
                  <Spinner size="lg" />
                </Flex>
              ) : (
                <Avatar
                  size="2xl"
                  src={imagePreview}
                  icon={<EditIcon fontSize="xl" />}
                />
              )}
              <Input
                ref={fileInputRef}
                type="file"
                display="none"
                accept="image/*"
                onChange={handleImageChange}
              />
            </Box>
          </Box>

          <Box>
            <Heading size="md">{authUser?.displayName || "User"}</Heading>
            <Text>{authUser?.email}</Text>
            <HStack mt={3} spacing={3} flexWrap="wrap">
              <Button onClick={() => router.push("/subscription")}>View Subscription</Button>
              <Button onClick={() => router.push("/change-password")} colorScheme="gray">Change Password</Button>
              <Button onClick={() => { auth.signOut(); router.push("/auth/login"); }} colorScheme="red">Logout</Button>
            </HStack>
          </Box>
        </Flex>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex mt={6} direction={{ base: "column", sm: "row" }} gap={4}>
            <FormControl isInvalid={errors.phone}>
              <FormLabel>Phone</FormLabel>
              <Input type="tel" placeholder="Your phone" {...register("phone", { required: "Phone is required" })} />
              {errors.phone && <Text color="red.500">{errors.phone.message}</Text>}
            </FormControl>

            <FormControl>
              <FormLabel>Address</FormLabel>
              <Input type="text" placeholder="Your address" {...register("address")} />
            </FormControl>
          </Flex>

          <Button mt={6} type="submit" colorScheme="blue" isLoading={isSubmitting} w="full">
            Save Profile
          </Button>
        </form>

        <Divider my={6} />
        <VStack>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </VStack>
      </Container>
    </Box>
  );
}

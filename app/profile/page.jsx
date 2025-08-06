
// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { updateProfile } from "firebase/auth";
// import { doc, setDoc } from "firebase/firestore";
// import { auth, db } from "@/lib/firebaseConfig";
// import { useForm } from "react-hook-form";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { useDocument } from "react-firebase-hooks/firestore";
// import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
// import { Spinner } from "@chakra-ui/react"; // keep only this one Spinner

// export default function ProfilePage() {
//   const router = useRouter();
//   const [authUser, authLoading] = useAuthState(auth);
//   const [isUploading, setIsUploading] = useState(false);
//   const [profileImage, setProfileImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const fileInputRef = useRef();

//   const [profileSnapshot, profileLoading] = useDocument(
//     authUser ? doc(db, "users", authUser.uid) : null
//   );

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     formState: { errors, isSubmitting },
//   } = useForm();

//   useEffect(() => {
//     if (!authLoading && !authUser) router.push("/auth/login");
//   }, [authUser, authLoading, router]);

//   useEffect(() => {
//     if (authUser) {
//       setValue("displayName", authUser.displayName || "");
//       setValue("email", authUser.email || "");
//     }
//     if (profileSnapshot?.exists()) {
//       const data = profileSnapshot.data();
//       setValue("phone", data.phone || "");
//       setValue("address", data.address || "");
//       setValue("bio", data.bio || "");
//       setImagePreview(data.photoURL || authUser?.photoURL || null);
//     }
//   }, [authUser, profileSnapshot, setValue]);

//   const handleImageChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file || !authUser) return;

//     if (file.size > 2 * 1024 * 1024) {
//       alert("Max file size is 2MB");
//       return;
//     }

//     setIsUploading(true);
//     try {
//       const imageURL = await uploadToCloudinary(file);
//       await updateProfile(authUser, { photoURL: imageURL });

//       await setDoc(doc(db, "users", authUser.uid), {
//         photoURL: imageURL,
//         updateAt: new Date(),
//       }, { merge: true });

//       setImagePreview(imageURL);
//       alert("Profile picture updated!");
//     } catch (err) {
//       console.error("Upload failed:", err);
//       alert("Upload failed. Try again.");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const onSubmit = async (data) => {
//     try {
//       await updateProfile(authUser, {
//         displayName: data.displayName,
//         ...(imagePreview && { photoURL: imagePreview }),
//       });

//       await setDoc(doc(db, "users", authUser.uid), {
//         name: data.displayName,
//         email: data.email,
//         phone: data.phone || "",
//         address: data.address || "",
//         bio: data.bio || "",
//         photoURL: imagePreview || "",
//         updateAt: new Date(),
//       }, { merge: true });

//       alert("Profile updated successfully.");
//     } catch (error) {
//       console.error("Update failed:", error);
//       alert("Update failed. Try again.");
//     }
//   };

//   if (authLoading || profileLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Spinner size="xl" />
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 pt-24 dark:bg-gray-900 min-h-screen">
//       <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//         <div className="flex flex-col sm:flex-row items-center gap-6">
//           <div className="relative w-24 h-24 sm:w-32 sm:h-32">
//             <button
//               className="w-full h-full rounded-full overflow-hidden border border-gray-300 dark:border-gray-700"
//               onClick={() => fileInputRef.current.click()}
//             >
//               {isUploading ? (
//                 <div className="flex items-center justify-center w-full h-full">
//                   <Spinner size="lg" />
//                 </div>
//               ) : (
//                 <img
//                   src={imagePreview || "/avatar-placeholder.png"}
//                   alt="Profile"
//                   className="w-full h-full object-cover rounded-full"
//                 />
//               )}
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={handleImageChange}
//               />
//             </button>
//           </div>
//           <div className="text-center sm:text-left">
//             <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
//               {authUser?.displayName || "User"}
//             </h2>
//             <p className="text-gray-500 dark:text-gray-400">{authUser?.email}</p>
//             <div className="flex gap-3 flex-wrap mt-3 justify-center sm:justify-start">
//               <button
//                 onClick={() => router.push("/change-password")}
//                 className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
//               >
//                 Change Password
//               </button>
//               <button
//                 onClick={() => {
//                   auth.signOut();
//                   router.push("/auth/login");
//                 }}
//                 className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
//           <div className="grid sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Phone
//               </label>
//               <input
//                 type="tel"
//                 placeholder="Your phone"
//                 {...register("phone", { required: "Phone is required" })}
//                 className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
//               />
//               {errors.phone && (
//                 <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Address
//               </label>
//               <input
//                 type="text"
//                 placeholder="Your address"
//                 {...register("address")}
//                 className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Bio <span className="text-xs text-gray-400">(optional)</span>
//             </label>
//             <textarea
//               placeholder="A short bio or introduction..."
//               {...register("bio")}
//               rows={3}
//               className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
//           >
//             {isSubmitting ? "Saving..." : "Save Profile"}
//           </button>
//         </form>

//         <div className="mt-6 flex justify-center">
//           <button
//             onClick={() => router.push("/dashboard")}
//             className="text-blue-600 hover:underline text-sm"
//           >
//             Go to Dashboard
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import { useForm } from "react-hook-form";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocument } from "react-firebase-hooks/firestore";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { Spinner } from "@chakra-ui/react"; // only keeping this for now

export default function ProfilePage() {
  const router = useRouter();
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
    if (!authLoading && !authUser) router.push("/auth/login");
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
      setValue("bio", data.bio || "");
      setImagePreview(data.photoURL || authUser?.photoURL || null);
    }
  }, [authUser, profileSnapshot, setValue]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !authUser) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Max file size is 2MB");
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
      alert("Profile picture updated!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await updateProfile(authUser, {
        displayName: data.displayName,
        ...(imagePreview && { photoURL: imagePreview }),
      });

      await setDoc(doc(db, "users", authUser.uid), {
        name: data.displayName,
        email: data.email,
        phone: data.phone || "",
        address: data.address || "",
        bio: data.bio || "",
        photoURL: imagePreview || "",
        updateAt: new Date(),
      }, { merge: true });

      alert("Profile updated successfully.");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Update failed. Try again.");
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 to-indigo-600 px-4 py-24">
      <div className="w-full max-w-xl bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-8 shadow-lg text-white dark:bg-white/10 dark:text-white">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative">
            <button
              onClick={() => fileInputRef.current.click()}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg"
            >
              {isUploading ? (
                <div className="flex items-center justify-center w-full h-full">
                  <Spinner size="lg" />
                </div>
              ) : (
                <img
                  src={imagePreview || "/avatar-placeholder.png"}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold">{authUser?.displayName || "User"}</h2>
            <p className="text-sm text-white/80">{authUser?.email}</p>
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => router.push("/change-password")}
              className="bg-white/30 hover:bg-white/40 text-white font-medium py-1.5 px-4 rounded-full transition"
            >
              Change Password
            </button>
            <button
              onClick={() => {
                auth.signOut();
                router.push("/");
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-4 rounded-full transition"
            >
              Logout
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                type="tel"
                placeholder="Your phone"
                {...register("phone", { required: "Phone is required" })}
                className="w-full mt-1 px-4 py-2 bg-white/30 text-white placeholder-white/60 rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-white"
              />
              {errors.phone && (
                <p className="text-sm text-red-300 mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Address</label>
              <input
                type="text"
                placeholder="Your address"
                {...register("address")}
                className="w-full mt-1 px-4 py-2 bg-white/30 text-white placeholder-white/60 rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Bio <span className="text-xs text-white/60">(optional)</span></label>
            <textarea
              placeholder="A short bio or introduction..."
              {...register("bio")}
              rows={3}
              className="w-full mt-1 px-4 py-2 bg-white/30 text-white placeholder-white/60 rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-blue-600 font-semibold py-2 rounded-full hover:bg-gray-100 transition"
          >
            {isSubmitting ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-white/90 hover:underline text-sm"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

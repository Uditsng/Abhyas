// utils/uploadToCloudinary.js
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET); 
  formData.append("folder", "profile_pictures"); 

  const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  console.log("Cloudinary upload response:", data);

  if (!data.secure_url) {     
      throw new Error("Upload failed"); 
  }
  return data.secure_url; 
};

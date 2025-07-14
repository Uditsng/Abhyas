// utils/uploadToCloudinary.js
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "unsigned_test"); // from step 2
  formData.append("folder", "profile_pictures"); // optional

  const response = await fetch(`https://api.cloudinary.com/v1_1/dx3wkv766/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!data.secure_url) throw new Error("Upload failed");

  return data.secure_url; // This is your image URL
};

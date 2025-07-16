// lib/bundleService.js
import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs} from 'firebase/firestore';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

// Upload image to Cloudinary and return download URL
export const uploadBundleImage = async (file) => {
  // Use the shared utility for Cloudinary upload
  return await uploadToCloudinary(file);
};

// Create a new bundle in Firestore and return the new bundle's ID
export const createBundle = async (bundleData) => {
  const bundlesCol = collection(db, 'bundles');
  const docRef = await addDoc(bundlesCol, {
    ...bundleData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Get all bundles from Firestore, optionally filtered by createdBy
export const getAllBundles = async (createdBy = null) => {
  const bundlesCol = collection(db, 'bundles');
  const snapshot = await getDocs(bundlesCol);
  let bundles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (createdBy) {
    bundles = bundles.filter(bundle => bundle.createdBy === createdBy);
  }
  return bundles;
};

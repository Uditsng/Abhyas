// lib/bundleService.js
import { db } from './firebaseConfig';
import { collection, doc, addDoc, serverTimestamp, getDoc, getDocs} from 'firebase/firestore';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

export const uploadBundleImage = async (file) => {
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

//Get bundles by an array of bundleIds
export const getBundlesByIds = async (bundleIds = []) => {
  const bundles = [];
  for (const id of bundleIds) {
    const bundleRef = doc(db, 'bundles', id);
    const bundleSnap = await getDoc(bundleRef);
    if (bundleSnap.exists()) {
      bundles.push({ id, ...bundleSnap.data() });
    }
  }
  return bundles;
};
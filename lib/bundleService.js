// lib/bundleService.js
import { db, storage } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL} from 'firebase/storage';

// Upload image to Firebase Storage and return download URL
export const uploadBundleImage = async (file) => {
  const imageRef = ref(storage, `bundle-images/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(imageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
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

// // lib/bundleService.js
// import { db } from './firebaseConfig';
// import { collection, doc, addDoc, serverTimestamp, getDoc, getDocs, query, where, documentId, Timestamp, updateDoc } from 'firebase/firestore';
// import { uploadToCloudinary } from '../utils/uploadToCloudinary';

// export const uploadBundleImage = async (file) => {
//   return await uploadToCloudinary(file);
// };

// // Create a new bundle in Firestore and return the new bundle's ID
// export const createBundle = async (bundleData) => {
//   const bundlesCol = collection(db, 'bundles');
//   const docRef = await addDoc(bundlesCol, {
//     ...bundleData,
//     createdAt: serverTimestamp(),
//   });
//   return docRef.id;
// };

// // Get all bundles from Firestore, optionally filtered by createdBy
// // export const getAllBundles = async (createdBy = null) => {
// //   const bundlesCol = collection(db, 'bundles');
// //   const snapshot = await getDocs(bundlesCol);
// //   let bundles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// //   if (createdBy) {
// //     bundles = bundles.filter(bundle => bundle.createdBy === createdBy);
// //   }
// //   return bundles;
// // };

// export const getAllBundles = async (createdBy = null) => {
//   const bundlesCol = collection(db, "bundles");
//   let bundleQuery;

//   if (createdBy) {
//     // If createdBy is provided, fetch all bundles by that user (for admins/creators)
//     bundleQuery = query(bundlesCol, where("createdBy", "==", createdBy));
//   } else {
//     // For regular users, only fetch live and published bundles
//     bundleQuery = query(
//       bundlesCol,
//       where("status", "==", "live"),
//       where("publishDate", "<=", Timestamp.now())
//     );
//   }

//   const snapshot = await getDocs(bundleQuery);
//   const bundles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

//   return bundles;
// };

// //Get bundles by an array of bundleIds
// export const getBundlesByIds = async (bundleIds = []) => {
//   if (!bundleIds || bundleIds.length === 0) {
//     return [];
//   }
//   try {
//     const bundles = [];
//     const chunkSize = 30; // Use a more efficient chunk size
//     for (let i = 0; i < bundleIds.length; i += chunkSize) {
//       const chunk = bundleIds.slice(i, i + chunkSize);
//       const bundlesQuery = query(collection(db, 'bundles'), where(documentId(), 'in', chunk));
//       const querySnapshot = await getDocs(bundlesQuery);
//       querySnapshot.forEach((doc) => {
//         bundles.push({ id: doc.id, ...doc.data() });
//       });
//     }
//     return bundles;
//   } catch (error) {
//     console.error("Error fetching bundles by IDs: ", error);
//     return [];
//   }
// };

// export const getBundleById = async (bundleId) => {
//   try {
//     const bundleRef = doc(db, 'bundles', bundleId);
//     const bundleSnap = await getDoc(bundleRef);

//     if (bundleSnap.exists()) {
//       return { id: bundleSnap.id, ...bundleSnap.data() };
//     } else {
//       return null;
//     }
//   } catch (error) {
//     console.error('Error fetching bundle by ID:', error);
//     throw error;
//   }
// };


// export const getBundlesBySubExamCategory = async (subCategory) => {
//   if (!subCategory) return [];
//   try {
//     const bundlesCol = collection(db, 'bundles');
//     const q = query(bundlesCol, where('subExamCategory', '==', subCategory));
//     const snapshot = await getDocs(q);
//     return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//   } catch (error) {
//     console.error('Error fetching bundles by sub-exam category:', error);
//     throw error;
//   }
// };

// export const updateBundle = async (bundleId, data) => {
//   const bundleRef = doc(db, "bundles", bundleId);
//   await updateDoc(bundleRef, data);
// };

// lib/bundleService.js
import { db } from './firebaseConfig';
import { 
    collection, 
    doc, 
    addDoc, 
    serverTimestamp, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    documentId, 
    Timestamp, 
    updateDoc 
} from 'firebase/firestore';
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
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// Get all bundles from Firestore, optionally filtered by createdBy
export const getAllBundles = async (createdBy = null) => {
  const bundlesCol = collection(db, "bundles");
  let bundleQuery;

  if (createdBy) {
    // If createdBy is provided, fetch all bundles by that user (for admins/creators)
    bundleQuery = query(bundlesCol, where("createdBy", "==", createdBy));
  } else {
    // For regular users, only fetch live and published bundles
    bundleQuery = query(
      bundlesCol,
      where("status", "==", "live"),
      where("publishDate", "<=", Timestamp.now())
    );
  }

  const snapshot = await getDocs(bundleQuery);
  const bundles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return bundles;
};

//Get bundles by an array of bundleIds
export const getBundlesByIds = async (bundleIds = []) => {
  if (!bundleIds || bundleIds.length === 0) {
    return [];
  }
  try {
    const bundles = [];
    const chunkSize = 30;
    for (let i = 0; i < bundleIds.length; i += chunkSize) {
      const chunk = bundleIds.slice(i, i + chunkSize);
      const bundlesQuery = query(collection(db, 'bundles'), where(documentId(), 'in', chunk));
      const querySnapshot = await getDocs(bundlesQuery);
      querySnapshot.forEach((doc) => {
        bundles.push({ id: doc.id, ...doc.data() });
      });
    }
    return bundles;
  } catch (error) {
    console.error("Error fetching bundles by IDs: ", error);
    return [];
  }
};

export const getBundleById = async (bundleId) => {
  try {
    const bundleRef = doc(db, 'bundles', bundleId);
    const bundleSnap = await getDoc(bundleRef);

    if (bundleSnap.exists()) {
      return { id: bundleSnap.id, ...bundleSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching bundle by ID:', error);
    throw error;
  }
};

export const getBundlesBySubExamCategory = async (subCategory) => {
  if (!subCategory) return [];
  try {
    const bundlesCol = collection(db, 'bundles');
    const q = query(
        bundlesCol, 
        where('subExamCategory', '==', subCategory),
        where("status", "==", "live"),
        where("publishDate", "<=", Timestamp.now())
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching bundles by sub-exam category:', error);
    throw error;
  }
};

export const updateBundle = async (bundleId, data) => {
  const bundleRef = doc(db, "bundles", bundleId);
  await updateDoc(bundleRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};
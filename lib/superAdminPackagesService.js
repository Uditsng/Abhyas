import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { getAdminIdToNameMap } from './superAdminAdminService';

// Fetch all packages
export async function getAllPackages() {
  const packagesCol = collection(db, 'packages');
  const snapshot = await getDocs(packagesCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Create a new package
export async function createPackage(packageData) {
  const packagesCol = collection(db, 'packages');
  const docRef = await addDoc(packagesCol, { 
    ...packageData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Edit a package
export async function editPackage(packageId, packageData) {
  await updateDoc(doc(db, 'packages', packageId), {
    ...packageData,
    updatedAt: serverTimestamp()
  });
}

// Delete a package
export async function deletePackage(packageId) {
  await deleteDoc(doc(db, 'packages', packageId));
}

// Get package stats (sales, revenue) - This can be enhanced later if needed
export async function getPackageStats(packageId) {
  const transactionsCol = collection(db, 'transactions');
  const q = query(transactionsCol, where('packageId', '==', packageId));
  const txSnap = await getDocs(q);
  let totalSales = 0;
  let totalRevenue = 0;
  txSnap.forEach(doc => {
    const data = doc.data();
    if (data.amount) totalRevenue += Number(data.amount);
    totalSales++;
  });
  return { totalSales, totalRevenue };
}

// Fetch all bundles with their creator's name
export async function getAllBundlesWithAdminName() {
  const bundlesCol = collection(db, 'bundles');
  const snapshot = await getDocs(bundlesCol);
  const bundles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const adminNameMap = await getAdminIdToNameMap();

  return bundles.map(bundle => ({
    ...bundle,
    adminName: adminNameMap[bundle.createdBy] || 'Unknown Admin'
  }));
}

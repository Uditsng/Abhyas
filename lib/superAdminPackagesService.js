import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

// Fetch all packages
export async function getAllPackages() {
  const packagesCol = collection(db, 'packages');
  const snapshot = await getDocs(packagesCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Create a new package
export async function createPackage({ name, examId, bundleIds, price }) {
  const packagesCol = collection(db, 'packages');
  const docRef = await addDoc(packagesCol, { name, examId, bundleIds, price });
  return docRef.id;
}

// Edit a package
export async function editPackage(packageId, { name, examId, bundleIds, price }) {
  await updateDoc(doc(db, 'packages', packageId), { name, examId, bundleIds, price });
}

// Delete a package
export async function deletePackage(packageId) {
  await deleteDoc(doc(db, 'packages', packageId));
}

// Get package stats (sales, revenue)
export async function getPackageStats(packageId) {
  // Count transactions for this package
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

// Fetch all bundles
export async function getAllBundles() {
  const bundlesCol = collection(db, 'bundles');
  const snapshot = await getDocs(bundlesCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Merge bundles (combine tests from sourceBundleIds into targetBundleId)
export async function mergeBundles(targetBundleId, sourceBundleIds) {
  // This is a placeholder: actual merging logic depends on your data model
  // For now, just mark source bundles as merged into target
  for (const sourceId of sourceBundleIds) {
    await updateDoc(doc(db, 'bundles', sourceId), { mergedInto: targetBundleId });
  }
}

// Assign bundle to admin
export async function assignBundleToAdmin(bundleId, adminId) {
  await updateDoc(doc(db, 'bundles', bundleId), { adminId });
}

// Get bundle engagement/sales stats
export async function getBundleStats(bundleId) {
  // Count transactions for this bundle
  const transactionsCol = collection(db, 'transactions');
  const q = query(transactionsCol, where('bundleId', '==', bundleId));
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
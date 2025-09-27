//lib/superAdminAdminService.js
import { db } from './firebaseConfig';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, where,limit } from 'firebase/firestore';

// Fetch all admins
export async function getAllAdmins(limitCount = 100) {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('role', '==', 'admin'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Create a map of Admin IDs to their display names for efficient lookup
export async function getAdminIdToNameMap() {
    const admins = await getAllAdmins(1000); // Fetch a larger number for the map
    const adminMap = {};
    admins.forEach(admin => {
        adminMap[admin.id] = admin.displayName || admin.name || 'Unnamed Admin';
    });
    return adminMap;
}

// Validate admin (set validated: true)
export async function validateAdmin(adminId) {
  await updateDoc(doc(db, 'users', adminId), { validated: true });
}

// Block or unblock an admin (set status)
export async function setAdminStatus(adminId, status) {
  await updateDoc(doc(db, 'users', adminId), { status });
}

// Delete an admin
export async function deleteAdmin(adminId) {
  await deleteDoc(doc(db, 'users', adminId));
}

// Get admin stats accurately and efficiently
export async function getAdminStats(adminId) {
  // 1. Get orders created by this admin to calculate total earnings
  const ordersQuery = query(
    collection(db, "orders"),
    where("createdBy", "==", adminId),
    where("status", "==", "paid")
  );
  const ordersSnapshot = await getDocs(ordersQuery);

  let totalAdminEarnings = 0;
  ordersSnapshot.forEach((doc) => {
    //sum the 'adminEarning' field
    totalAdminEarnings += doc.data().adminEarning || 0;
  });

  // 2. Separately, get the count of all bundles created by this admin
  const bundlesQuery = query(
    collection(db, "bundles"),
    where("createdBy", "==", adminId)
  );
  const bundlesSnapshot = await getDocs(bundlesQuery);
  const bundlesCreated = bundlesSnapshot.size;

  return {
    bundlesCreated,
    revenue: totalAdminEarnings,
    engagement: ordersSnapshot.size, 
  };
}
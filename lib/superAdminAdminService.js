import { db } from './firebaseConfig';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, where,limit } from 'firebase/firestore';

// Fetch all admins
export async function getAllAdmins(limitCount = 100) {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('role', '==', 'admin'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

// Get admin stats more efficiently
export async function getAdminStats(adminId) {
  // 1. Get all bundles created by this admin
  const bundlesQuery = query(collection(db, 'bundles'), where('createdBy', '==', adminId));
  const bundlesSnap = await getDocs(bundlesQuery);
  const bundlesCreated = bundlesSnap.size;
  const bundleIds = bundlesSnap.docs.map(d => d.id);

  if (bundleIds.length === 0) {
    return { bundlesCreated: 0, revenue: 0, engagement: 0 };
  }


// 2. Get all orders for those bundles
  // Note: Firestore 'in' query is limited to 30 items. If an admin can have more, this needs chunking.
  const ordersQuery = query(collection(db, 'orders'), where('bundleId', 'in', bundleIds), where('status', '==', 'paid'));
  const ordersSnap = await getDocs(ordersQuery);
  
  let revenue = 0;
  ordersSnap.forEach(doc => {
    revenue += Number(doc.data().amount || 0);
  });

  return {
    bundlesCreated,
    revenue,
    engagement: ordersSnap.size,
  };
}
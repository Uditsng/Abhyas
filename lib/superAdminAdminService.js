import { db } from './firebaseConfig';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';

// Fetch all admins
export async function getAllAdmins() {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, where('role', '==', 'admin'));
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

// Get admin stats: bundles created, revenue, engagement
export async function getAdminStats(adminId) {
  // Bundles created
  const bundlesCol = collection(db, 'bundles');
  const bundlesQuery = query(bundlesCol, where('adminId', '==', adminId));
  const bundlesSnap = await getDocs(bundlesQuery);
  const bundlesCreated = bundlesSnap.size;

  // Revenue (sum of transactions for this admin)
  const transactionsCol = collection(db, 'transactions');
  const txQuery = query(transactionsCol, where('adminId', '==', adminId));
  const txSnap = await getDocs(txQuery);
  let revenue = 0;
  txSnap.forEach(doc => {
    const data = doc.data();
    if (data.amount) revenue += Number(data.amount);
  });

  // Engagement: total number of bundle purchases (transactions)
  const engagement = txSnap.size;

  return {
    bundlesCreated,
    revenue,
    engagement
  };
} 
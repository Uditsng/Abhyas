//superAdminDashboardService.js (No useless code)

import { db } from './firebaseConfig';
import { collection, getDocs,getDoc, query, where,doc } from 'firebase/firestore';

// Get total users
export async function getTotalUsers() {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, where('role', '==', 'user'));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

// Get total admins
export async function getTotalAdmins() {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, where('role', '==', 'admin'));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

// Get total earnings (sum of all transaction amounts)
export async function getTotalEarnings() {
  const snapshot = await getDocs (collection(db, 'orders'));
  let total = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.status === 'paid' && data.amount) {
      total += Number(data.amount);
    }
  });
  return total;
}

// Platform commision calc
export async function getPlatformCommissionRate() {
  const commissionDocRef = doc(db, 'platformSettings', 'commission');
  const commissionDoc = await getDoc(commissionDocRef);
  if (commissionDoc.exists()) {
    return commissionDoc.data().rate; // or commissionDoc.get('rate');
  } else {
    throw new Error('Commission rate not defined in Firestore');
  }
}

// Corrected commission fetch based on actual commissionAmount field
export async function getPlatformCommission() {
  const snapshot = await getDocs(
    query(collection(db, 'orders'), where('status', '==', 'paid'))
  );

  let totalCommission = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    totalCommission += Number(data.commissionAmount || 0);
  });

  return totalCommission.toFixed(2);
}
// Get monthly growth data (users/admins created per month)
export async function getGrowthData() {
  const usersCol = collection(db, 'users');
  const snapshot = await getDocs(usersCol);
  const growth = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.createdAt && data.role) {
      const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!growth[month]) growth[month] = { users: 0, admins: 0 };
      if (data.role === 'admin') growth[month].admins++;
      else if(data.role === 'user') growth[month].users++;
    }
  });
  return growth;
}

// Get monthly revenue data
export async function getRevenueData() {
  const snapshot = await getDocs(collection(db, 'orders'));
  const revenue = {};

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.status === 'paid' && data.amount && data.date) {
      const dateObj = data.date.toDate ? data.date.toDate() : new Date(data.date);
      const month = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
     
      if (!revenue[month]) revenue[month] = 0;
      revenue[month] += Number(data.amount);
    }
  });
  return revenue;
}


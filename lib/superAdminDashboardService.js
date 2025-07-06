import { db } from './firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

// Get total users
export async function getTotalUsers() {
  const usersCol = collection(db, 'users');
  const snapshot = await getDocs(usersCol);
  return snapshot.size;
}

// Get active users (who have purchased any bundle)
export async function getActiveUsers() {
  const transactionsCol = collection(db, 'transactions');
  const snapshot = await getDocs(transactionsCol);
  const userIds = new Set();
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.userId) userIds.add(data.userId);
  });
  return userIds.size;
}

// Get total earnings (sum of all transaction amounts)
export async function getTotalEarnings() {
  const transactionsCol = collection(db, 'transactions');
  const snapshot = await getDocs(transactionsCol);
  let total = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.amount) total += Number(data.amount);
  });
  return total;
}

// Get platform commission (20% of total earnings)
export async function getPlatformCommission() {
  const total = await getTotalEarnings();
  return total * 0.2;
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
      else growth[month].users++;
    }
  });
  return growth;
}

// Get monthly revenue data
export async function getRevenueData() {
  const transactionsCol = collection(db, 'transactions');
  const snapshot = await getDocs(transactionsCol);
  const revenue = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.createdAt && data.amount) {
      const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!revenue[month]) revenue[month] = 0;
      revenue[month] += Number(data.amount);
    }
  });
  return revenue;
}

// Get top/bottom 5 teachers (admins by revenue)
export async function getTopBottomTeachers() {
  const transactionsCol = collection(db, 'transactions');
  const snapshot = await getDocs(transactionsCol);
  const adminRevenue = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.adminId && data.amount) {
      if (!adminRevenue[data.adminId]) adminRevenue[data.adminId] = 0;
      adminRevenue[data.adminId] += Number(data.amount);
    }
  });
  const sorted = Object.entries(adminRevenue).sort((a, b) => b[1] - a[1]);
  return {
    top: sorted.slice(0, 5),
    bottom: sorted.slice(-5)
  };
}

// Get top/bottom 5 bundles (by sales)
export async function getTopBottomBundles() {
  const transactionsCol = collection(db, 'transactions');
  const snapshot = await getDocs(transactionsCol);
  const bundleSales = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.bundleId && data.amount) {
      if (!bundleSales[data.bundleId]) bundleSales[data.bundleId] = 0;
      bundleSales[data.bundleId] += Number(data.amount);
    }
  });
  const sorted = Object.entries(bundleSales).sort((a, b) => b[1] - a[1]);
  return {
    top: sorted.slice(0, 5),
    bottom: sorted.slice(-5)
  };
} 
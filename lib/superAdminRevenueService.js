import { db } from './firebaseConfig';
import { collection, getDocs, updateDoc, doc, query, where, addDoc, serverTimestamp } from 'firebase/firestore';

// Get all transactions
export async function getAllTransactions() {
  const transactionsCol = collection(db, 'transactions');
  const snapshot = await getDocs(transactionsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get all payouts
export async function getAllPayouts() {
  const payoutsCol = collection(db, 'payouts');
  const snapshot = await getDocs(payoutsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Create a payout request (for admin)
export async function createPayoutRequest(adminId, amount) {
  const payoutsCol = collection(db, 'payouts');
  await addDoc(payoutsCol, {
    adminId,
    amount,
    status: 'pending',
    createdAt: serverTimestamp(),
    paidAt: null
  });
}

// Mark payout as paid
export async function markPayoutAsPaid(payoutId) {
  await updateDoc(doc(db, 'payouts', payoutId), {
    status: 'paid',
    paidAt: serverTimestamp()
  });
}

// Get total earnings and commission
export async function getEarningsAndCommission() {
  const transactionsCol = collection(db, 'transactions');
  const snapshot = await getDocs(transactionsCol);
  let total = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.amount) total += Number(data.amount);
  });
  return {
    totalEarnings: total,
    platformCommission: total * 0.2
  };
}

// Get monthly revenue breakdown
export async function getMonthlyRevenue() {
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

// Get payout history for an admin
export async function getPayoutHistoryForAdmin(adminId) {
  const payoutsCol = collection(db, 'payouts');
  const q = query(payoutsCol, where('adminId', '==', adminId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
} 
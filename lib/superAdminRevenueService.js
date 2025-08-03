import { db } from './firebaseConfig';
import { collection, getDocs, getDoc, updateDoc, doc, query, where, addDoc, serverTimestamp } from 'firebase/firestore';

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
  const snapshot = await getDocs(
    query(collection(db, 'orders'), where('status', '==', 'paid'))
  );

  let totalSales = 0;
  let totalCommission = 0
  let totalAdminEarning = 0

  snapshot.forEach(doc => {
    const data = doc.data();
    totalSales += Number(data.amount || 0)
    totalCommission += Number(data.commissionAmount || 0)
    totalAdminEarning += Number(data.adminEarning || 0)
  });
  return {
    totalEarnings: totalSales,
    platformCommission: totalCommission,
    totalAdminEarning,
  };
}

// Get monthly revenue breakdown
export async function getMonthlyRevenue() {
  const snapshot = await getDocs(
    query(collection(db, 'orders'), where('status', '==', 'paid'))
  );
  const revenue = {};

  snapshot.forEach(doc => {
    const data = doc.data();
    const date = data.date?.toDate?.() || new Date(data.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if(!revenue[month]){ revenue[month] = {sales: 0, commission:0}}

    revenue[month].sales += Number(data.amount || 0)
    revenue[month].commission += Number(data.commissionAmount || 0)
  });
    
  return revenue;
}

// Admin-specific payout history
export async function getPayoutHistoryForAdmin(adminId) {
  const payoutsCol = collection(db, 'payouts');
  const q = query(payoutsCol, where('adminId', '==', adminId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}


// ✅ Commission rate config fetch
export async function getPlatformCommissionRate() {
  const docSnap = await getDoc(doc(db, 'platformSettings', 'commission'));
  return docSnap.exists() ? docSnap.data().rate : 20;
}
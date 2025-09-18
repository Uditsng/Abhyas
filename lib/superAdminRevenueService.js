//lib/superAdminRevenueService.js

import { db } from './firebaseConfig';
import { collection, getDocs, getDoc, updateDoc, doc, query, where, addDoc, serverTimestamp, documentId } from 'firebase/firestore';
import { enrichPackage } from './packageService';

export async function getAllPayouts() {
  const payoutsCol = collection(db, 'payouts');
  const snapshot = await getDocs(payoutsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

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

export async function markPayoutAsPaid(payoutId) {
  await updateDoc(doc(db, 'payouts', payoutId), {
    status: 'paid',
    paidAt: serverTimestamp()
  });
}

export async function getEarningsAndCommission() {
  const snapshot = await getDocs(
    query(collection(db, 'orders'), where('status', '==', 'paid'))
  );

  let totalSales = 0, totalTax = 0, totalCommission = 0, totalAdminEarning = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    totalSales += Number(data.amount || 0)
    totalCommission += Number(data.commissionAmount || 0)
    totalAdminEarning += Number(data.adminEarning || 0)
    totalTax += Number(data.taxAmount || 0);
  });
  return {
    totalEarnings: totalSales,
    platformCommission: totalCommission,
    totalAdminEarning,
    totalTaxCollected: totalTax,
  };
}

export async function getMonthlyRevenue() {
  const snapshot = await getDocs(
    query(collection(db, 'orders'), where('status', '==', 'paid'))
  );
  const revenue = {};
  const gstRate = 0.18;

  snapshot.forEach(doc => {
    const data = doc.data();
    const date = data.date?.toDate?.() || new Date(data.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const amount = Number(data.bundlePrice || 0);
    const gst = amount * gstRate;
    if(!revenue[month]){ revenue[month] = {sales: 0, commission:0, gst:0}}

    revenue[month].sales += Number(data.amount || 0)
    revenue[month].commission += Number(data.commissionAmount || 0)
    revenue[month].gst += gst;
  });
    
  return revenue;
}

export async function getPayoutHistoryForAdmin(adminId) {
  const payoutsCol = collection(db, 'payouts');
  const q = query(payoutsCol, where('adminId', '==', adminId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getPlatformCommissionRate() {
  const docSnap = await getDoc(doc(db, 'platformSettings', 'commission'));
  return docSnap.exists() ? docSnap.data().rate : 20;
}


async function getDocsByIds(collectionName, ids) {
    if (!ids || ids.length === 0) return new Map();
    
    const docMap = new Map();
    const chunks = [];
    for (let i = 0; i < ids.length; i += 30) {
        chunks.push(ids.slice(i, i + 30));
    }

    for (const chunk of chunks) {
        const q = query(collection(db, collectionName), where(documentId(), 'in', chunk));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => docMap.set(doc.id, { id: doc.id, ...doc.data() }));
    }
    return docMap;
}

export const getPackageRevenueData = async () => {
    try {
        const ordersQuery = query(collection(db, 'orders'), where('itemType', '==', 'package'));
        const ordersSnapshot = await getDocs(ordersQuery);
        const packageOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (packageOrders.length === 0) {
            return { sales: [], totalRevenue: 0, totalGST: 0, realEarning: 0, totalCommission: 0 };
        }

        const packageIds = [...new Set(packageOrders.map(order => order.packageId))];
        const userIds = [...new Set(packageOrders.map(order => order.userId))];

        const [rawPackagesMap, usersMap, commissionRate] = await Promise.all([
            getDocsByIds('packages', packageIds),
            getDocsByIds('users', userIds),
            getPlatformCommissionRate(),
        ]);
        
        const enrichedPackagesMap = new Map();
        for (const [id, pkg] of rawPackagesMap.entries()) {
            const enrichedPkg = await enrichPackage(pkg);
            enrichedPackagesMap.set(id, enrichedPkg);
        }

        const GST_RATE = 0.18;
        let totalRevenue = 0, totalGST = 0, totalCommission = 0;
        const enrichedSales = [];

        for (const order of packageOrders) {
            const pkg = enrichedPackagesMap.get(order.packageId); // Use the enriched map
            const user = usersMap.get(order.userId);

            const totalAmount = order.amount;
            const basePrice = totalAmount / (1 + GST_RATE);
            const gstAmount = totalAmount - basePrice;
            const platformCommission = (basePrice * commissionRate) / 100;
            const netEarningForAdmins = basePrice - platformCommission;

            totalRevenue += totalAmount;
            totalGST += gstAmount;
            totalCommission += platformCommission;

            let adminEarningsBreakdown = [];

            if (pkg && pkg.bundles && pkg.bundles.length > 0) {
                const totalOriginalValue = pkg.bundles.reduce((sum, b) => sum + (b.price || 0), 0);

                if (totalOriginalValue > 0) {
                    for (const bundle of pkg.bundles) {
                        const contributionPercent = (bundle.price || 0) / totalOriginalValue;
                        const adminEarning = netEarningForAdmins * contributionPercent;
                        
                        const adminDoc = await getDoc(doc(db, "users", bundle.createdBy));
                        const adminName = adminDoc.exists() ? adminDoc.data().name : "Unknown Admin";

                        adminEarningsBreakdown.push({
                            adminId: bundle.createdBy,
                            adminName: adminName,
                            bundleTitle: bundle.title,
                            earning: adminEarning,
                        });
                    }
                }
            }

            enrichedSales.push({
                ...order,
                packageName: pkg ? pkg.name : 'Unknown Package',
                buyerName: user ? user.name : 'Unknown User',
                buyerEmail: user ? user.email : 'N/A',
                gstAmount,
                platformCommission,
                netEarningForAdmins,
                adminEarningsBreakdown,
            });
        }
        
        enrichedSales.sort((a, b) => b.date.toMillis() - a.date.toMillis());

        return { 
            sales: enrichedSales, 
            totalRevenue, 
            totalGST, 
            realEarning: totalRevenue - totalGST,
            totalCommission,
        };

    } catch (error) {
        console.error("Error fetching detailed package revenue data:", error);
        throw error;
    }
};
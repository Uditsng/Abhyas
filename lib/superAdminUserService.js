
import { db } from './firebaseConfig';
import { collection, getDocs,getDoc, updateDoc, doc, deleteDoc, query, where, } from 'firebase/firestore';

// Fetch all users (only those with role === 'user')
export async function getAllUsers() {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, where('role', '==', 'user'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Block or unblock a user (set status)
export async function setUserStatus(userId, status) {
  await updateDoc(doc(db, 'users', userId), { status });
}

// Delete a user
export async function deleteUser(userId) {
  await deleteDoc(doc(db, 'users', userId));
}


// Get user activity more efficiently
export async function getUserStats(userId) {
  // 1. Fetch transactions and test results in parallel
  const transactionsQuery = query(collection(db, 'orders'), where('userId', '==', userId));
  const testResultsQuery = collection(db, 'users', userId, 'testResults');

  const [txSnap, trSnap, userDoc] = await Promise.all([
    getDocs(transactionsQuery),
    getDocs(testResultsQuery),
    getDoc(doc(db, 'users', userId))
  ]);

  // 2. Process results
  const bundlesPurchased = txSnap.size;
  const testsTaken = trSnap.size;

  let totalSpent = 0;
  txSnap.forEach(doc => {
      totalSpent += doc.data().amount || 0;
  });


  let lastPurchase = null;
  txSnap.forEach(d => {
    const data = d.data();
    const date = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt.seconds * 1000) : null);
    if (date && (!lastPurchase || date > lastPurchase)) lastPurchase = date;
  });

  let lastTest = null;
  trSnap.forEach(d => {
    const data = d.data();
    const date = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt.seconds * 1000) : null);
    if (date && (!lastTest || date > lastTest)) lastTest = date;
  });

  // 3. Calculate active time
  const lastActivity = lastPurchase && lastTest ? (lastPurchase > lastTest ? lastPurchase : lastTest) : (lastPurchase || lastTest);
  

  return { bundlesPurchased, testsTaken,   lastSeen: lastActivity, totalSpent };
}
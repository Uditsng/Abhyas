import { db } from './firebaseConfig';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, where, orderBy } from 'firebase/firestore';

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

// Get user activity: bundles purchased, tests taken, active time
export async function getUserActivity(userId) {
  // Bundles purchased: count transactions with userId
  const transactionsCol = collection(db, 'transactions');
  const txQuery = query(transactionsCol, where('userId', '==', userId));
  const txSnap = await getDocs(txQuery);
  const bundlesPurchased = txSnap.size;
  let lastPurchase = null;
  txSnap.forEach(doc => {
    const data = doc.data();
    if (data.createdAt) {
      const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      if (!lastPurchase || date > lastPurchase) lastPurchase = date;
    }
  });

  // Tests taken: count testResults subcollection
  const testResultsCol = collection(db, 'users', userId, 'testResults');
  const trSnap = await getDocs(testResultsCol);
  const testsTaken = trSnap.size;
  let lastTest = null;
  trSnap.forEach(doc => {
    const data = doc.data();
    if (data.createdAt) {
      const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      if (!lastTest || date > lastTest) lastTest = date;
    }
  });

  // Active time: from createdAt to latest of lastPurchase or lastTest
  let activeTime = null;
  let lastActivity = lastPurchase && lastTest ? (lastPurchase > lastTest ? lastPurchase : lastTest) : (lastPurchase || lastTest);
  if (lastActivity) {
    // Fetch user createdAt
    const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId)));
    let createdAt = null;
    userDoc.forEach(doc => {
      const data = doc.data();
      if (data.createdAt) createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
    });
    if (createdAt) {
      activeTime = Math.round((lastActivity - createdAt) / (1000 * 60 * 60 * 24)); // days
    }
  }

  return {
    bundlesPurchased,
    testsTaken,
    activeTime // in days
  };
} 
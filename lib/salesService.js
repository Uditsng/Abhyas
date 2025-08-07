import { db } from "./firebaseConfig";
import { collection, query, where, getDocs, getDoc, doc,documentId} from "firebase/firestore";

// Get all bundles created by this admin
export async function getBundlesByAdmin(adminUid) {
  const snapshot = await getDocs(
    query(collection(db, "bundles"), where("createdBy", "==", adminUid))
  );
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}


export async function getOrdersForBundle(bundleId) {
  const q = query(
    collection(db, "orders"),
    where("bundleId", "==", bundleId),
    where("status", "==", "paid")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}


export async function getUserInfo(userId) {
  const userDoc = await getDoc(doc(db, "users", userId));
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
}

// Efficiently fetch multiple users by their IDs
export async function getUsersByIds(userIds) {
  if (!userIds || userIds.length === 0) {
    return {};
  }
  const usersMap = {};
  // Firestore 'in' queries are limited to 30 items per query
  const chunks = [];
  for (let i = 0; i < userIds.length; i += 30) {
    chunks.push(userIds.slice(i, i + 30));
  }

  for (const chunk of chunks) {
    const q = query(collection(db, "users"), where(documentId(), "in", chunk));
    const userSnapshot = await getDocs(q);
    userSnapshot.forEach((doc) => {
      usersMap[doc.id] = doc.data();
    });
  }
  return usersMap;
}
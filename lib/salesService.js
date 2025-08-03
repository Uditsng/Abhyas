import { db } from "./firebaseConfig";
import { collection, query, where, getDocs, getDoc, doc,} from "firebase/firestore";

// ✅ Get all bundles created by this admin
export async function getBundlesByAdmin(adminUid) {
  const snapshot = await getDocs(collection(db, "bundles"));
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((bundle) => bundle.createdBy === adminUid);
}

// ✅ Get all orders for a given bundle (optionally filtered by date)
export async function getOrdersForBundle(bundleId, startDate, endDate) {
  const q = query(
    collection(db, "orders"),
    where("bundleId", "==", bundleId),
    where("status", "==", "paid")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((order) => {
      if (!order.date) return false;
      const orderDate = order.date.toDate();
      if (startDate && endDate) {
        return orderDate >= startDate && orderDate <= endDate;
      }
      return true;
    });
}

// ✅ Get a user's profile from Firestore
export async function getUserInfo(userId) {
  const userDoc = await getDoc(doc(db, "users", userId));
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
}

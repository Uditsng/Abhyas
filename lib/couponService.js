import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, doc, updateDoc, query, where, getDoc } from 'firebase/firestore';

const couponsCollection = collection(db, 'coupons');

// Function to create a new coupon
export const createCoupon = async (couponData) => {
  try {
    await addDoc(couponsCollection, {
      ...couponData,
      isActive: true,
      createdAt: new Date(),
    });
    console.log("Coupon created successfully");
  } catch (error) {
    console.error("Error creating coupon: ", error);
    throw error;
  }
};

// Function to fetch all coupons
export const getCoupons = async () => {
  try {
    const snapshot = await getDocs(couponsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching coupons: ", error);
    throw error;
  }
};

// Function to update a coupon's status
export const updateCouponStatus = async (couponId, isActive) => {
  try {
    const couponRef = doc(db, 'coupons', couponId);
    await updateDoc(couponRef, { isActive });
    console.log(`Coupon ${isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    console.error("Error updating coupon status: ", error);
    throw error;
  }
};

// Function to get a coupon by its code
export const getCouponByCode = async (code) => {
    try {
        const q = query(couponsCollection, where("code", "==", code));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            // Assuming coupon codes are unique
            const couponDoc = querySnapshot.docs[0];
            return { id: couponDoc.id, ...couponDoc.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching coupon by code: ", error);
        throw error;
    }
};
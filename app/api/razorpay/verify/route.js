//api/razorpay/verify/route.js

import { db } from "@/lib/firebaseConfig";
import { doc, setDoc, arrayUnion, getDoc, updateDoc } from "firebase/firestore";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    user,
    bundle,
    amount,
  } = await req.json();

  // 1. Verify signature
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return NextResponse.json(
      { success: false, message: "Invalid signature" },
      { status: 400 }
    );
  }

  // 2. Get commission rate from platformSettings
  const commissionSnap = await getDoc(
    doc(db, "platformSettings", "commission")
  );
  const commissionRate = commissionSnap.exists()
    ? commissionSnap.data().rate
    : 20;

  const actualAmount = amount / 100; // Total amount paid by user (includes GST)
  const bundlePrice = actualAmount / 1.18; // Base price before GST
  const taxAmount = actualAmount - bundlePrice; // GST portion
  const commissionAmount = (commissionRate / 100) * bundlePrice; // Platform cut
  const adminEarning = bundlePrice - commissionAmount; // Final earning for Admin

  // 3. Save payment and order to Firestore
  const bundleRef = doc(db, "bundles", bundle.id);
  const bundleSnap = await getDoc(bundleRef);
  const createdBy = bundleSnap.exists() ? bundleSnap.data().createdBy : null;
  const orderRef = doc(db, "orders", razorpay_payment_id);
  await setDoc(orderRef, {
    userId: user.uid,
    bundleId: bundle.id,
    createdBy,
    amount: actualAmount,
    bundlePrice, // <-- Base price before GST
    taxAmount,
    status: "paid",
    paymentID: razorpay_payment_id,
    orderId: razorpay_order_id,
    date: new Date(),
    commissionRate,
    commissionAmount,
    adminEarning,
  });

  // 4. Add bundleId to user's purchasedBundles array
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    await updateDoc(userRef, { purchasedBundles: arrayUnion(bundle.id) });
  } else {
    await setDoc(userRef, {
      purchasedBundles: [bundle.id],
    });
  }

  return NextResponse.json({ success: true });
}

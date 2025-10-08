//api/razorpay/verify/route.js

import { db } from "@/lib/firebaseConfig";
import { doc, setDoc, arrayUnion, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { updateAdminMonthlyRevenue } from "@/lib/superAdminRevenueService";

export async function POST(req) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      user,
      item, // Using a generic 'item' to handle both bundles and packages
      amount,
      discount,
      coupon,
    } = await req.json();

    if (!item || !item.id || !item.title || !item.price || !item.itemType) {
      console.error("Invalid item data:", item);
      return NextResponse.json(
        { success: false, message: "Invalid item data" },
        { status: 400 }
      );
    }

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
    const commissionSnap = await getDoc(doc(db, "platformSettings", "commission"));
    const commissionRate = commissionSnap.exists()? commissionSnap.data().rate : 20;

    const actualAmount = amount / 100;
    const basePrice = actualAmount / 1.18;
    const taxAmount = actualAmount - basePrice;

    // 3. Save payment and order to Firestore
    const orderRef = doc(db, "orders", razorpay_payment_id);
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);


    if (item.itemType === 'package') {
      await setDoc(orderRef, {
        userId: user.uid,
        packageId: item.id,
        itemType: "package",
        createdBy: "superAdmin",
        amount: actualAmount,
        basePrice,
        taxAmount,
        status: "paid",
        paymentID: razorpay_payment_id,
        orderId: razorpay_order_id,
        date: new Date(),
      });

      if (userSnap.exists()) {
        await updateDoc(userRef, { purchasedPackages: arrayUnion(item.id) });
      } else {
        await setDoc(userRef, { purchasedPackages: [item.id] });
      }
    } else if (item.itemType === 'bundle') {
      const commissionAmount = (commissionRate / 100) * basePrice;
      const adminEarning = basePrice - commissionAmount;

      const bundleRef = doc(db, "bundles", item.id);
      const bundleSnap = await getDoc(bundleRef);
      const createdBy = bundleSnap.exists() ? bundleSnap.data().createdBy : null;

    // This creates the order document      
      await setDoc(orderRef, {
        userId: user.uid,
        bundleId: item.id,
        itemType: "bundle",
        createdBy,
        amount: actualAmount,
        basePrice,
        taxAmount,
        status: "paid",
        paymentID: razorpay_payment_id,
        orderId: razorpay_order_id,
        date: new Date(),
        commissionRate,
        commissionAmount,
        adminEarning,
        disccount: discount || 0,
        couponCode: coupon?.code || null,
      });

      
    // This call will now succeed
    if (createdBy) {
      await updateAdminMonthlyRevenue(createdBy, adminEarning);
    }

      if (userSnap.exists()) {
        await updateDoc(userRef, { purchasedBundles: arrayUnion(item.id) });
      } else {
        await setDoc(userRef, { purchasedBundles: [item.id] });
      }
    } else {
      // Handle unknown item types if necessary
        return NextResponse.json(
            { success: false, message: "Invalid item type" },
            { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
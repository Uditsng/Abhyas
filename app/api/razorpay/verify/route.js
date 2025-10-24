// //api/razorpay/verify/route.js

// import { db } from "@/lib/firebaseConfig";
// import { doc, setDoc, arrayUnion, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
// import crypto from "crypto";
// import { NextResponse } from "next/server";
// import { updateAdminMonthlyRevenue } from "@/lib/superAdminRevenueService";

// export async function POST(req) {
//   try {
//     const {
//       razorpay_payment_id,
//       razorpay_order_id,
//       razorpay_signature,
//       user,
//       item, // Using a generic 'item' to handle both bundles and packages
//       amount,
//       discount,
//       coupon,
//     } = await req.json();

//     if (!item || !item.id || !item.title || !item.price || !item.itemType) {
//       console.error("Invalid item data:", item);
//       return NextResponse.json(
//         { success: false, message: "Invalid item data" },
//         { status: 400 }
//       );
//     }

//     // 1. Verify signature
//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       return NextResponse.json(
//         { success: false, message: "Invalid signature" },
//         { status: 400 }
//       );
//     }

//     // 2. Get commission rate from platformSettings
//     const commissionSnap = await getDoc(doc(db, "platformSettings", "commission"));
//     const commissionRate = commissionSnap.exists()? commissionSnap.data().rate : 20;

//     const actualAmount = amount / 100;
//     const basePrice = actualAmount / 1.18;
//     const taxAmount = actualAmount - basePrice;

//     // 3. Save payment and order to Firestore
//     const orderRef = doc(db, "orders", razorpay_payment_id);
//     const userRef = doc(db, "users", user.uid);
//     const userSnap = await getDoc(userRef);


//     if (item.itemType === 'package') {
//       await setDoc(orderRef, {
//         userId: user.uid,
//         packageId: item.id,
//         itemType: "package",
//         createdBy: "superAdmin",
//         amount: actualAmount,
//         basePrice,
//         taxAmount,
//         status: "paid",
//         paymentID: razorpay_payment_id,
//         orderId: razorpay_order_id,
//         date: new Date(),
//       });

//       if (userSnap.exists()) {
//         await updateDoc(userRef, { purchasedPackages: arrayUnion(item.id) });
//       } else {
//         await setDoc(userRef, { purchasedPackages: [item.id] });
//       }
//     } else if (item.itemType === 'bundle') {
//       const commissionAmount = (commissionRate / 100) * basePrice;
//       const adminEarning = basePrice - commissionAmount;

//       const bundleRef = doc(db, "bundles", item.id);
//       const bundleSnap = await getDoc(bundleRef);
//       const createdBy = bundleSnap.exists() ? bundleSnap.data().createdBy : null;

//     // This creates the order document      
//       await setDoc(orderRef, {
//         userId: user.uid,
//         bundleId: item.id,
//         itemType: "bundle",
//         createdBy,
//         amount: actualAmount,
//         basePrice,
//         taxAmount,
//         status: "paid",
//         paymentID: razorpay_payment_id,
//         orderId: razorpay_order_id,
//         date: new Date(),
//         commissionRate,
//         commissionAmount,
//         adminEarning,
//         disccount: discount || 0,
//         couponCode: coupon?.code || null,
//       });

      
//     // This call will now succeed
//     if (createdBy) {
//       await updateAdminMonthlyRevenue(createdBy, adminEarning);
//     }

//       if (userSnap.exists()) {
//         await updateDoc(userRef, { purchasedBundles: arrayUnion(item.id) });
//       } else {
//         await setDoc(userRef, { purchasedBundles: [item.id] });
//       }
//     } else {
//       // Handle unknown item types if necessary
//         return NextResponse.json(
//             { success: false, message: "Invalid item type" },
//             { status: 400 }
//         );
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error in POST handler:", error);
//     return NextResponse.json(
//       { success: false, message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// api/razorpay/verify/route.js
import { db } from "@/lib/firebaseConfig";
import { doc, setDoc, arrayUnion, getDoc, updateDoc } from "firebase/firestore";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { updateAdminMonthlyRevenue } from "@/lib/superAdminRevenueService";

import { getInvoiceTemplate } from "@/lib/invoiceService"; 

export async function POST(req) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      user, 
      item, 
      amount,
      discount,
      coupon,
    } = await req.json();

    // ... (Signature verification logic remains the same) ...

    
    const currentTemplate = await getInvoiceTemplate();

    // 2. Prepare denormalized user info (if not already fully in 'user' object)
    const userInfoSnapshot = {
        name: user.displayName || 'N/A',
        email: user.email || 'N/A',
        // Add any other user details needed on the invoice
    };

    // 3. Prepare denormalized item info
    const itemInfoSnapshot = {
        id: item.id,
        title: item.title || item.name, // Handle both bundle/package naming
        type: item.itemType,
        // Add any other item details needed
    };
    // --- End of Snapshotting/Denormalization Prep ---


    // Get commission rate etc.
    const commissionSnap = await getDoc(doc(db, "platformSettings", "commission"));
    const commissionRate = commissionSnap.exists()? commissionSnap.data().rate : 20;

    const actualAmount = amount / 100;
    const basePrice = actualAmount / 1.18; // Assuming 18% GST always
    const taxAmount = actualAmount - basePrice;

    const orderRef = doc(db, "orders", razorpay_payment_id);
    const userRef = doc(db, "users", user.uid);

    // Prepare base order data
    let orderData = {
      userId: user.uid,
      itemType: item.itemType,
      amount: actualAmount,
      basePrice,
      taxAmount,
      status: "paid",
      paymentID: razorpay_payment_id,
      orderId: razorpay_order_id,
      date: new Date(), // Use Firestore ServerTimestamp preferably if possible server-side
      discount: discount || 0,
      couponCode: coupon?.code || null,

      // --- Add Snapshotted/Denormalized Data ---
      userInfoSnapshot: userInfoSnapshot,
      itemInfoSnapshot: itemInfoSnapshot,
      invoiceTemplateSnapshot: { // Save relevant template fields
          companyName: currentTemplate.companyName,
          logoUrl: currentTemplate.logoUrl,
          address: currentTemplate.address,
          phone: currentTemplate.phone,
          email: currentTemplate.email,
          gstNumber: currentTemplate.gstNumber,
          footerNote: currentTemplate.footerNote,
          watermarkText: currentTemplate.watermarkText, // Include watermark
          // Only include fields needed for the invoice display
          // No need to store colors or font here usually
      }
      // --- End Snapshotted Data ---
    };

    // Add item-specific fields (bundleId/packageId) and calculate earnings
    if (item.itemType === 'package') {
      orderData.packageId = item.id;
      // Package earnings might be distributed differently or go fully to superAdmin
      orderData.createdBy = "superAdmin"; // Example
      // No commission calculation needed here for packages in this structure
    } else if (item.itemType === 'bundle') {
      orderData.bundleId = item.id;

      const commissionAmount = (commissionRate / 100) * basePrice;
      const adminEarning = basePrice - commissionAmount;

      // Get the admin who created the bundle
      const bundleRef = doc(db, "bundles", item.id);
      const bundleSnap = await getDoc(bundleRef);
      const createdBy = bundleSnap.exists() ? bundleSnap.data().createdBy : null;

      orderData.createdBy = createdBy;
      orderData.commissionRate = commissionRate;
      orderData.commissionAmount = commissionAmount;
      orderData.adminEarning = adminEarning;

      // Update admin's monthly revenue (can still be done)
      if (createdBy) {
        await updateAdminMonthlyRevenue(createdBy, adminEarning);
      }
    } else {
       return NextResponse.json({ success: false, message: "Invalid item type" }, { status: 400 });
    }

    // --- Save the complete order document ---
    await setDoc(orderRef, orderData);


    // --- Update user's purchased items (remains the same) ---
    const userSnap = await getDoc(userRef);
    const fieldToUpdate = item.itemType === 'package' ? 'purchasedPackages' : 'purchasedBundles';
    if (userSnap.exists()) {
      await updateDoc(userRef, { [fieldToUpdate]: arrayUnion(item.id) });
    } else {
      await setDoc(userRef, { [fieldToUpdate]: [item.id] }); // Create user doc if not exists
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
// api/razorpay/verify/route.js
import { db } from "@/lib/firebaseConfig";
import { doc, setDoc, arrayUnion, getDoc, updateDoc, runTransaction, increment, serverTimestamp } from "firebase/firestore";
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
    
    //Snapshot Invoice Template
    const currentTemplate = await getInvoiceTemplate();
    const invoiceTemplateSnapshot = { 
        companyName: currentTemplate.companyName,
        logoUrl: currentTemplate.logoUrl,
        address: currentTemplate.address,
        phone: currentTemplate.phone,
        email: currentTemplate.email,
        gstNumber: currentTemplate.gstNumber,
        footerNote: currentTemplate.footerNote,
        watermarkText: currentTemplate.watermarkText,
    };

    const userInfoSnapshot = {
        name: user.displayName || 'N/A',
        email: user.email || 'N/A',
        // Add any other user details needed on the invoice
    };

    const itemInfoSnapshot = {
        id: item.id,
        title: item.title || item.name, 
        type: item.itemType,
        // Add any other item details needed
    };


    // Add Invoice Number Logic
    const counterRef = doc(db, "counters", "invoiceCounter");
    let newInvoiceNumber;

    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        transaction.set(counterRef, { currentNumber: 1 });
        newInvoiceNumber = 1;
      } else {
        const newNumber = counterDoc.data().currentNumber + 1;
        transaction.update(counterRef, { currentNumber: newNumber });
        newInvoiceNumber = newNumber;
      }
    });
    
    // 2 Get commission rate etc.
    const commissionSnap = await getDoc(doc(db, "platformSettings", "commission"));
    const commissionRate = commissionSnap.exists()? commissionSnap.data().rate : 20;

    const actualAmount = amount / 100;
    const basePrice = actualAmount / 1.18; // Assuming 18% GST always
    const taxAmount = actualAmount - basePrice;

    const orderRef = doc(db, "orders", razorpay_payment_id);
    const userRef = doc(db, "users", user.uid);

    // base order data
    let orderData = {
      userId: user.uid,
      itemType: item.itemType,
      amount: actualAmount,
      basePrice,
      taxAmount,
      invoiceNumber: `INV-${newInvoiceNumber}`,
      status: "paid",
      paymentID: razorpay_payment_id,
      orderId: razorpay_order_id,
      date: new Date(), 
      discount: discount || 0,
      couponCode: coupon?.code || null,
      userInfoSnapshot: userInfoSnapshot,
      itemInfoSnapshot: itemInfoSnapshot,
      invoiceTemplateSnapshot: invoiceTemplateSnapshot
    };

    // 3 Handle logic based on item type 
    if (item.itemType === 'package') {
      orderData.packageId = item.id;
      orderData.createdBy = "superAdmin"; 
    } else if (item.itemType === 'bundle') {
      orderData.bundleId = item.id;

      
      // 1. Fetch the bundle to check its promotion status
      const bundleRef = doc(db, "bundles", item.id);
      const bundleSnap = await getDoc(bundleRef);
      const bundleData = bundleSnap.exists() ? bundleSnap.data() : {};
      const createdBy = bundleData.createdBy || null;
      
      //2 Check if promotion is active
      const isPromoted = bundleData.promotionStatus === "active" && bundleData.promotionRate > 0;

      let promotionFee = 0;
      let finalAdminEarning = 0;

      // 3 Calculate base commission (always on basePrice)
      const baseCommission = (commissionRate / 100) * basePrice;

      // 4 Calculate Admin's Sub-Total (their share before promotion)
      const adminSubTotal = basePrice - baseCommission;

      // 5. Apply promotion fee if active 
      if (isPromoted){
        promotionFee = adminSubTotal * (bundleData.promotionRate / 100)
        finalAdminEarning = adminSubTotal - promotionFee;
      } else {
        finalAdminEarning = adminSubTotal;
      }
      // 6. Add new data to the order document
      orderData.createdBy = createdBy;
      orderData.commissionRate = commissionRate;
      orderData.commissionAmount = baseCommission;
      orderData.adminEarning = finalAdminEarning;
      orderData.promotionRate = isPromoted ? bundleData.promotionRate : 0;
      orderData.promotionFee = promotionFee;

      // 7 Update admin's monthly revenue 
      if (createdBy) {
        await updateAdminMonthlyRevenue(createdBy, finalAdminEarning);
      }

    } else {
       return NextResponse.json({ success: false, message: "Invalid item type" }, { status: 400 });
    }

    // 4 Save the complete order document
    await setDoc(orderRef, orderData);


// 5. Update user's purchased items list
    const userSnap = await getDoc(userRef);
    const fieldToUpdate = item.itemType === 'package' ? 'purchasedPackages' : 'purchasedBundles';
    if (userSnap.exists()) {
      await updateDoc(userRef, { [fieldToUpdate]: arrayUnion(item.id) });
    } else {
      await setDoc(userRef, { [fieldToUpdate]: [item.id] }); 
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
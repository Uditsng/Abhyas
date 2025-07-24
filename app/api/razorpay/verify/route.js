import { db } from "@/lib/firebaseConfig"
import { doc, setDoc } from "firebase/firestore"
import crypto from "crypto"
import {NextResponse} from "next/server"

export async function POST(req){
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, user, bundle, amount } = await req.json()

     // 1. Verify signature
     const generatedSignature = crypto
     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
     .update(razorpay_order_id+ "|" + razorpay_payment_id)
     .digest("hex")

     if (generatedSignature !== razorpay_signature){
        return NextResponse.json({ success: false, message:"Invalid signature"},{status: 400})
     }

     // 2. Save payment and order to Firestore
     const orderRef = doc(db, "orders", razorpay_payment_id)
     await setDoc(orderRef,{
        userId: user.uid,
        bundleId: bundle.id,
        amount,
        status:"paid",
        paymentID: razorpay_payment_id,
        orderId: razorpay_order_id,
        date: new Date(),
     })

     return NextResponse.json({success: true})
}
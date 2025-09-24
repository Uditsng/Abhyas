// app/api/auth/verify-otp/route.js

import { NextResponse } from "next/server";
import { firestore } from "../../../../lib/firebaseAdmin";


export async function POST(request) {
  const { email, otp } = await request.json();

  if (!email || !otp) {
    return NextResponse.json(
      { error: "Email and OTP are required." },
      { status: 400 }
    );
  }

  try {
    const otpDoc = await firestore.collection("otps").doc(email).get();

    if (!otpDoc.exists) {
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    const { otp: storedOtp, otpExpires } = otpDoc.data();
    
    if (new Date() > otpExpires.toDate()) {
      return NextResponse.json({ error: "OTP has expired." }, { status: 400 });
    }
    
    if (otp !== storedOtp) {
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

   
    await firestore.collection("otps").doc(email).delete();

    return NextResponse.json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP." },
      { status: 500 }
    );
  }
}
// app/api/auth/send-otp/route.js

import { NextResponse } from "next/server";
import { firestore } from "../../../../lib/firebaseAdmin";
import nodemailer from "nodemailer"; 

// function is created to handle the POST request
export async function POST(request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json(
      { error: "Email is required." },
      { status: 400 }
    );
  }

  // OTP is generated and its expiration time is set
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    await firestore.collection("otps").doc(email).set({
      otp,
      otpExpires,
    });

    //email is sent to the user with the OTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Abhyas",
      text: `Your OTP is ${otp}`,
    });

    return NextResponse.json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP." },
      { status: 500 }
    );
  }
}
// lib/firebaseAdmin.js
import admin from "firebase-admin";

if (!admin.apps?.length) {
  // Read the SECURE server-side variables
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin environment variables.");
  }

  privateKey = privateKey.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail,
      privateKey,
    }),
  });
}

const firestore = admin.firestore();
export { admin, firestore };
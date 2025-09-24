// app/api/sessions/create/route.js

import { nanoid } from "nanoid";
import { admin, firestore } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();
    const { idToken, userAgent } = body || {};

    if (!idToken) {
      return new Response(JSON.stringify({ error: "idToken required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // verify token using Admin SDK
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const userRef = firestore.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : {};

    // revoke old session if present
    if (userData?.currentSessionId) {
      try {
        await firestore.collection("sessions").doc(userData.currentSessionId).update({ status: "revoked", revokedAt: admin.firestore.FieldValue.serverTimestamp() });
      } catch (e) {
        console.warn("Old session revoke error:", e.message || e);
      }
    }

    const sessionId = nanoid();
    const sessionDoc = {
      uid,
      userAgent: userAgent || "unknown",
      status: "active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await firestore.collection("sessions").doc(sessionId).set(sessionDoc);

    // atomically set currentSessionId and lastseen on user 
    await userRef.set({ currentSessionId: sessionId, lastSeenAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

    // audit log 
    await firestore.collection("auditLogs").add({
      uid,
      eventType: "login",
      metadata: { sessionId, userAgent },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // set HttpOnly cookie. Adjust Max-Age as needed.
    const maxAgeSec = 30 * 24 * 60 * 60; // 30 days
    const secureFlag = process.env.NODE_ENV === "production" ? "Secure; " : "";
    const cookie = `abhyas_sid=${sessionId}; Path=/; HttpOnly; SameSite=Strict; ${secureFlag}Max-Age=${maxAgeSec}`;

    return new Response(JSON.stringify({ ok: true, sessionId }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookie,
      },
    });
  } catch (err) {
    console.error("sessions/create error:", err);
    return new Response(JSON.stringify({ error: err.message || "Server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

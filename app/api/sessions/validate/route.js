// app/api/sessions/validate/route.js
import { admin, firestore } from "@/lib/firebaseAdmin";

function parseCookie(header) {
  if (!header) return null;
  const match = header.match(/abhyas_sid=([^;]+)/);
  return match ? match[1] : null;
}

export async function GET(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const sessionId = parseCookie(cookieHeader);
    if (!sessionId) return new Response(JSON.stringify({ valid: false, reason: "no_session" }), { status: 401, headers: { "Content-Type": "application/json" } });

    const snap = await firestore.collection("sessions").doc(sessionId).get();
    if (!snap.exists) return new Response(JSON.stringify({ valid: false, reason: "not_found" }), { status: 401, headers: { "Content-Type": "application/json" } });

    const data = snap.data();
    if (data.status !== "active") return new Response(JSON.stringify({ valid: false, reason: "revoked" }), { status: 401, headers: { "Content-Type": "application/json" } });

    return new Response(JSON.stringify({ valid: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("sessions/validate error:", err);
    return new Response(JSON.stringify({ valid: false, error: err.message || "server" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// app/api/sessions/revoke/route.js
import { admin, firestore } from "@/lib/firebaseAdmin";

function parseCookie(header) {
  if (!header) return null;
  const match = header.match(/abhyas_sid=([^;]+)/);
  return match ? match[1] : null;
}

export async function POST(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const sessionId = parseCookie(cookieHeader);
    if (!sessionId) return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });

    // mark revoked
    try {
      await firestore.collection("sessions").doc(sessionId).update({ status: "revoked", revokedAt: admin.firestore.FieldValue.serverTimestamp() });
    } catch (e) {
      // ignore not found
    }

    // clear cookie
    const clearCookie = `abhyas_sid=deleted; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json", "Set-Cookie": clearCookie } });
  } catch (err) {
    console.error("sessions/revoke error:", err);
    return new Response(JSON.stringify({ error: err.message || "server" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

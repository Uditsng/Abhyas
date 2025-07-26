// lib/sanitizeText.js

export function sanitizeText(text) {
  if (!text) return "";
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

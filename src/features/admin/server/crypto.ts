/** Cryptography shared by the Google OAuth state and opaque D1 sessions. */
export function randomToken(bytes = 32): string {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return base64UrlEncode(data);
}

function base64UrlEncode(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

export async function sha256(value: string): Promise<string> {
  const raw = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return base64UrlEncode(new Uint8Array(raw));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]
  );
}

export type OAuthState = { state: string; verifier: string; issuedAt: number };

export async function sealOAuthState(value: OAuthState, secret: string): Promise<string> {
  const body = base64UrlEncode(new TextEncoder().encode(JSON.stringify(value)));
  const mac = await crypto.subtle.sign("HMAC", await hmacKey(secret), new TextEncoder().encode(body));
  return `${body}.${base64UrlEncode(new Uint8Array(mac))}`;
}

/** Reject modified, malformed, expired, or future-dated state cookies. */
export async function openOAuthState(cookie: string | undefined, secret: string, now = Date.now()): Promise<OAuthState | null> {
  if (!cookie || cookie.length > 2048) return null;
  const parts = cookie.split(".");
  if (parts.length !== 2) return null;
  const [body, mac] = parts;
  const bytes = base64UrlDecode(mac);
  const payload = base64UrlDecode(body);
  if (!bytes || !payload || bytes.length !== 32) return null;
  const valid = await crypto.subtle.verify("HMAC", await hmacKey(secret), bytes, new TextEncoder().encode(body));
  if (!valid) return null;
  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(payload));
    if (!value || typeof value !== "object") return null;
    const v = value as Record<string, unknown>;
    if (typeof v.state !== "string" || typeof v.verifier !== "string" || typeof v.issuedAt !== "number") return null;
    if (!/^[a-zA-Z0-9_-]{43}$/.test(v.state) || !/^[a-zA-Z0-9_-]{43}$/.test(v.verifier)) return null;
    if (now - v.issuedAt > 10 * 60_000 || v.issuedAt > now + 30_000) return null;
    return { state: v.state, verifier: v.verifier, issuedAt: v.issuedAt };
  } catch {
    return null;
  }
}

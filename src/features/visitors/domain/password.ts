/** Credential hashing using Workers-native Web Crypto, never fast SHA-256 alone. */
import { randomToken } from "../../admin/server/crypto.ts";

export const PASSWORD_ITERATIONS = 600_000;
export const PASSWORD_MIN_LENGTH = 15;
export const PASSWORD_MAX_LENGTH = 128;

export function isAcceptablePassword(password: unknown): password is string {
  return typeof password === "string" &&
    password.length >= PASSWORD_MIN_LENGTH &&
    password.length <= PASSWORD_MAX_LENGTH &&
    new TextEncoder().encode(password).length <= 256;
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  // A new ArrayBuffer-backed view satisfies the Web Crypto BufferSource contract.
  const safeSalt = new Uint8Array(new ArrayBuffer(salt.byteLength));
  safeSalt.set(salt);
  return new Uint8Array(await crypto.subtle.deriveBits({
    name: "PBKDF2", hash: "SHA-256", salt: safeSalt, iterations,
  }, key, 256));
}

function b64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "="));
    return Uint8Array.from(binary, c => c.charCodeAt(0));
  } catch { return null; }
}

export async function hashPassword(password: string): Promise<string> {
  if (!isAcceptablePassword(password)) throw new Error("INVALID_PASSWORD");
  // Generate salt from cryptographically secure random bytes.
  const salt = fromB64(randomToken(16));
  if (!salt || salt.byteLength !== 16) throw new Error("SALT_FAILURE");
  const hash = await derive(password, salt, PASSWORD_ITERATIONS);
  return `pbkdf2-sha256$${PASSWORD_ITERATIONS}$${b64(salt)}$${b64(hash)}`;
}

export async function verifyPassword(password: string, encoded: string | null): Promise<boolean> {
  if (!encoded || !isAcceptablePassword(password)) return false;
  const parts = encoded.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2-sha256" || parts[1] !== String(PASSWORD_ITERATIONS)) return false;
  const salt = fromB64(parts[2]);
  const expected = fromB64(parts[3]);
  if (!salt || salt.length !== 16 || !expected || expected.length !== 32) return false;
  const actual = await derive(password, salt, PASSWORD_ITERATIONS);
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

export function normalizeVisitorEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length < 5 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function cleanVisitorName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.trim().replace(/\s+/g, " ");
  return name.length >= 2 && name.length <= 80 ? name : null;
}

/** Server-only visitor identity. No visitor can become admin via these tables. */
import { cookies } from "next/headers";
import { getAdminDb, cookieOptions } from "../../admin/server/auth";
import { randomToken, sha256 } from "../../admin/server/crypto";
import { hashPassword, verifyPassword, normalizeVisitorEmail, cleanVisitorName, isAcceptablePassword } from "../domain/password";

const COOKIE = "naga_visitor_session";
const OAUTH_COOKIE = "naga_visitor_oauth_state";
const SESSION_SECONDS = 60 * 60 * 24 * 7;
const WINDOW_MS = 15 * 60_000;
const MAX_EMAIL_ATTEMPTS = 8;
const MAX_IP_ATTEMPTS = 30;

type Row = { id: string; email: string; display_name: string; password_hash: string | null; google_sub: string | null; email_verified: number; status: string };
export type Visitor = { id: string; email: string; display_name: string; email_verified: boolean };

export const visitorSessionCookieName = () => COOKIE;
export const visitorOAuthCookieName = () => OAUTH_COOKIE;
export const visitorSessionMaxAge = () => SESSION_SECONDS;
export const visitorCookieOptions = cookieOptions;

function db() { return getAdminDb(); }

/** Enforced server side; never trust caller-supplied roles. */
export async function getVisitorByToken(token: string | undefined): Promise<Visitor | null> {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const row = await db().prepare(`SELECT u.id, u.email, u.display_name, u.email_verified
    FROM visitor_sessions s JOIN visitor_users u ON u.id=s.visitor_id
    WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>? AND u.status='active' LIMIT 1`)
    .bind(await sha256(token), new Date().toISOString()).first<Pick<Row, "id" | "email" | "display_name" | "email_verified">>();
  return row ? { ...row, email_verified: row.email_verified === 1 } : null;
}

export async function getCurrentVisitor(): Promise<Visitor | null> {
  return getVisitorByToken((await cookies()).get(COOKIE)?.value);
}

async function sessionFor(userId: string): Promise<string> {
  const token = randomToken();
  await db().prepare("INSERT INTO visitor_sessions (id,visitor_id,token_hash,expires_at) VALUES (?,?,?,?)")
    .bind(crypto.randomUUID(), userId, await sha256(token), new Date(Date.now() + SESSION_SECONDS * 1000).toISOString()).run();
  return token;
}

export async function revokeVisitorSession(token: string | undefined): Promise<void> {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return;
  await db().prepare("UPDATE visitor_sessions SET revoked_at=? WHERE token_hash=? AND revoked_at IS NULL")
    .bind(new Date().toISOString(), await sha256(token)).run();
}

/** Hash rate keys so IP/email addresses are never stored in limiter tables. */
export async function consumeVisitorRateLimit(ip: string, email: string, action: "login" | "register"): Promise<boolean> {
  const keys = [
    { key: await sha256(`v1:ip:${action}:${ip}`), max: MAX_IP_ATTEMPTS },
    { key: await sha256(`v1:email:${action}:${email}`), max: MAX_EMAIL_ATTEMPTS },
  ];
  const start = Math.floor(Date.now() / WINDOW_MS);
  for (const { key, max } of keys) {
    const result = await db().prepare(`INSERT INTO visitor_auth_limits(rate_key, window_start, attempts)
      VALUES (?, ?, 1) ON CONFLICT(rate_key) DO UPDATE SET
      attempts = CASE WHEN window_start < excluded.window_start THEN 1 ELSE attempts + 1 END,
      window_start = excluded.window_start RETURNING attempts`)
      .bind(key, start).first<{ attempts: number }>();
    if (!result || result.attempts > max) return false;
  }
  return true;
}

export async function registerVisitor(nameRaw: unknown, emailRaw: unknown, passwordRaw: unknown): Promise<string | null> {
  const name = cleanVisitorName(nameRaw);
  const email = normalizeVisitorEmail(emailRaw);
  if (!name || !email || !isAcceptablePassword(passwordRaw)) return null;
  const existing = await db().prepare("SELECT id FROM visitor_users WHERE email=? LIMIT 1")
    .bind(email).first<{ id: string }>();
  if (existing) return null;
  const passwordHash = await hashPassword(passwordRaw);
  const id = crypto.randomUUID();
  await db().prepare(`INSERT INTO visitor_users (id,email,display_name,password_hash,email_verified)
    VALUES (?,?,?,?,0)`).bind(id, email, name, passwordHash).run();
  return sessionFor(id);
}

export async function loginVisitor(emailRaw: unknown, passwordRaw: unknown): Promise<string | null> {
  const email = normalizeVisitorEmail(emailRaw);
  if (!email || !isAcceptablePassword(passwordRaw)) return null;
  const user = await db().prepare("SELECT * FROM visitor_users WHERE email=? LIMIT 1")
    .bind(email).first<Row>();
  if (!user || user.status !== "active" || !(await verifyPassword(passwordRaw, user.password_hash))) return null;
  return sessionFor(user.id);
}

/** Google signup is verified by subject, NOT auto-linked by a matching email. */
export async function loginVisitorByGoogle(profile: { googleSub: string; email: string; name: string | null }): Promise<string | null> {
  const email = normalizeVisitorEmail(profile.email);
  if (!email || !profile.googleSub || profile.googleSub.length > 255) return null;
  let user = await db().prepare("SELECT * FROM visitor_users WHERE google_sub=? LIMIT 1")
    .bind(profile.googleSub).first<Row>();
  if (!user) {
    // An unverified password signup must never be taken over or auto-linked by email.
    const conflict = await db().prepare("SELECT id FROM visitor_users WHERE email=? LIMIT 1")
      .bind(email).first<{ id: string }>();
    if (conflict) return null;
    const id = crypto.randomUUID();
    await db().prepare(`INSERT INTO visitor_users(id,email,display_name,google_sub,email_verified)
      VALUES (?,?,?,?,1)`).bind(id,email,cleanVisitorName(profile.name) || email.split("@")[0].slice(0,80),profile.googleSub).run();
    user = await db().prepare("SELECT * FROM visitor_users WHERE id=? LIMIT 1")
      .bind(id).first<Row>();
  }
  if (!user || user.status !== "active" || user.email.toLowerCase() !== email) return null;
  return sessionFor(user.id);
}

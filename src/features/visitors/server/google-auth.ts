/** Google-only visitor identity. Cannot confer admin permissions. */
import { cookies } from "next/headers";
import { getAdminDb } from "@/features/admin/server/auth";
import { randomToken, sha256 } from "@/features/admin/server/crypto";

const SESSION_COOKIE = "naga_visitor_session";
const STATE_COOKIE = "naga_visitor_oauth_state";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

type VisitorRow = { id: string; email: string; display_name: string; google_sub: string; status: string };
export type Visitor = { id: string; email: string; display_name: string };

export function visitorSessionCookieName() { return SESSION_COOKIE; }
export function visitorStateCookieName() { return STATE_COOKIE; }
export function visitorSessionMaxAge() { return SESSION_SECONDS; }

export async function visitorByToken(token: string | undefined): Promise<Visitor | null> {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const hash = await sha256(token);
  const row = await getAdminDb().prepare(`SELECT u.id, u.email, u.display_name
    FROM visitor_sessions s JOIN visitor_users u ON u.id = s.visitor_id
    WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ?
      AND u.status = 'active' LIMIT 1`)
    .bind(hash, new Date().toISOString()).first<Visitor>();
  return row ?? null;
}

export async function currentVisitor(): Promise<Visitor | null> {
  return visitorByToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function revokeVisitorSession(token: string | undefined): Promise<void> {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return;
  await getAdminDb().prepare("UPDATE visitor_sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL")
    .bind(new Date().toISOString(), await sha256(token)).run();
}

/** Server-side only. Never trust the client-provided email as proof of ownership. */
export async function sessionForVerifiedGoogleVisitor(profile: { googleSub: string; email: string; name: string | null }): Promise<string | null> {
  const googleSub = profile.googleSub;
  const email = profile.email.trim().toLowerCase();
  if (!googleSub || googleSub.length > 255 ||
    email.length < 5 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  const db = getAdminDb();
  const id = crypto.randomUUID();
  const displayName = (profile.name?.trim() || email.split("@")[0]).slice(0, 80);
  // A conflict on email or subject is NOT permission to link a different identity.
  await db.prepare(`INSERT OR IGNORE INTO visitor_users(id, google_sub, email, display_name)
    VALUES (?, ?, ?, ?)`).bind(id, googleSub, email, displayName).run();
  const user = await db.prepare(`SELECT id, email, display_name, google_sub, status FROM visitor_users
    WHERE google_sub = ? AND email = ? COLLATE NOCASE LIMIT 1`)
    .bind(googleSub, email).first<VisitorRow>();
  if (!user || user.status !== "active") return null;
  const token = randomToken();
  await db.prepare("INSERT INTO visitor_sessions(id, visitor_id, token_hash, expires_at) VALUES (?, ?, ?, ?)")
    .bind(crypto.randomUUID(), user.id, await sha256(token), new Date(Date.now() + SESSION_SECONDS * 1000).toISOString()).run();
  return token;
}

/** Server-only Google OAuth + D1 session authority. No client-side role decisions. */
import { env } from "cloudflare:workers";
import { cookies } from "next/headers";
import { openOAuthState, randomToken, sealOAuthState, sha256, type OAuthState } from "./crypto";

const STATE_COOKIE = "naga_oauth_state";
const SESSION_COOKIE = "naga_admin_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

interface D1Query {
  bind(...args: (string | number | null)[]): D1Query;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}
interface D1Database {
  prepare(sql: string): D1Query;
}

type AdminRow = { id: string; google_sub: string; email: string; display_name: string | null; role: "owner" | "admin" | "editor"; status: "active" | "disabled" };
export type AdminSession = Pick<AdminRow, "id" | "email" | "display_name" | "role">;

type GoogleProfile = { sub?: string; email?: string; email_verified?: boolean | string; name?: string };

/** Workerd bindings in Vinext; local dotenv is also read as a server-side fallback. */
function configValue(key: string): string {
  const fromBinding = (env as unknown as Record<string, unknown>)[key];
  if (typeof fromBinding === "string" && fromBinding.trim()) return fromBinding.trim();
  return process.env[key]?.trim() ?? "";
}

function database(): D1Database {
  const db = (env as unknown as Record<string, unknown>).DB as D1Database | undefined;
  if (!db || typeof db.prepare !== "function") throw new Error("NAGA_D1_UNAVAILABLE");
  return db;
}

export function getGoogleConfig() {
  const id = configValue("AUTH_GOOGLE_ID");
  const clientSecret = configValue("AUTH_GOOGLE_SECRET");
  const secret = configValue("AUTH_SECRET");
  if (!id.endsWith(".apps.googleusercontent.com") || !clientSecret || secret.length < 40) {
    throw new Error("NAGA_AUTH_NOT_CONFIGURED");
  }
  return { id, clientSecret, secret };
}

export function cookieOptions(url: string) {
  return { httpOnly: true as const, secure: new URL(url).protocol === "https:", sameSite: "lax" as const, path: "/" };
}

export function oauthCookieName() { return STATE_COOKIE; }
export function sessionCookieName() { return SESSION_COOKIE; }

export async function googleAuthorization(requestUrl: string) {
  const { id, secret } = getGoogleConfig();
  const state: OAuthState = { state: randomToken(), verifier: randomToken(), issuedAt: Date.now() };
  const cookie = await sealOAuthState(state, secret);
  const origin = new URL(requestUrl).origin;
  const callbackUrl = `${origin}/api/auth/callback/google`;
  const params = new URLSearchParams({
    client_id: id,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    state: state.state,
    code_challenge: await sha256(state.verifier),
    code_challenge_method: "S256",
    access_type: "online",
  });
  return { url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`, cookie };
}

export async function verifiedGoogleProfile(requestUrl: string, code: string, returnedState: string, stateCookie: string | undefined) {
  const { id, clientSecret, secret } = getGoogleConfig();
  const state = await openOAuthState(stateCookie, secret);
  if (!state || state.state !== returnedState || !code || code.length > 4096) return null;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: id,
      client_secret: clientSecret,
      redirect_uri: `${new URL(requestUrl).origin}/api/auth/callback/google`,
      grant_type: "authorization_code",
      code_verifier: state.verifier,
    }),
    cache: "no-store",
  });
  if (!tokenResponse.ok) return null;
  const token: { access_token?: unknown; token_type?: unknown } = await tokenResponse.json();
  if (typeof token.access_token !== "string" || typeof token.token_type !== "string" || !/^bearer$/i.test(token.token_type)) return null;

  // Google returns a validated subject only for an access token issued by Google.
  const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` }, cache: "no-store",
  });
  if (!userResponse.ok) return null;
  const profile: GoogleProfile = await userResponse.json();
  if (!profile.sub || !profile.email || !(profile.email_verified === true || profile.email_verified === "true")) return null;
  return {
    googleSub: profile.sub,
    email: profile.email.trim().toLowerCase(),
    name: typeof profile.name === "string" ? profile.name.slice(0, 160) : null,
  };
}

/** First owner is created only after verified Google UserInfo AND exact configured allowlist match. */
export async function createSessionForGoogle(profile: { googleSub: string; email: string; name: string | null }): Promise<string | null> {
  const db = database();
  const bootstrapEmail = configValue("ADMIN_BOOTSTRAP_EMAIL").toLowerCase();
  const existing = await db.prepare("SELECT id, google_sub, email, display_name, role, status FROM admin_users WHERE google_sub = ? LIMIT 1")
    .bind(profile.googleSub).first<AdminRow>();
  if (!existing) {
    const total = await db.prepare("SELECT COUNT(*) AS n FROM admin_users").first<{ n: number }>();
    if (!total || total.n !== 0 || !bootstrapEmail || profile.email !== bootstrapEmail) return null;
    await db.prepare(`INSERT INTO admin_users (id, google_sub, email, display_name, role, status)
      SELECT ?, ?, ?, ?, 'owner', 'active' WHERE NOT EXISTS (SELECT 1 FROM admin_users)`)
      .bind(crypto.randomUUID(), profile.googleSub, profile.email, profile.name).run();
  }

  const admin = await db.prepare(`SELECT id, google_sub, email, display_name, role, status FROM admin_users
    WHERE google_sub = ? AND email = ? COLLATE NOCASE LIMIT 1`)
    .bind(profile.googleSub, profile.email).first<AdminRow>();
  if (!admin || admin.status !== "active") return null;

  const sessionToken = randomToken();
  const hash = await sha256(sessionToken);
  const expiry = new Date(Date.now() + SESSION_SECONDS * 1000).toISOString();
  await db.prepare("INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at) VALUES (?, ?, ?, ?)")
    .bind(crypto.randomUUID(), admin.id, hash, expiry).run();
  return sessionToken;
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  return getAdminByToken(session);
}

export async function getAdminByToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const hash = await sha256(token);
  const record = await database().prepare(`SELECT u.id, u.email, u.display_name, u.role
    FROM admin_sessions s JOIN admin_users u ON u.id = s.admin_id
    WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ? AND u.status = 'active' LIMIT 1`)
    .bind(hash, new Date().toISOString()).first<AdminSession>();
  return record ?? null;
}

export async function revokeSession(token: string | undefined): Promise<void> {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return;
  await database().prepare("UPDATE admin_sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL")
    .bind(new Date().toISOString(), await sha256(token)).run();
}

export function getAdminDb() { return database(); }
export function adminSessionMaxAge() { return SESSION_SECONDS; }

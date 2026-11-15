import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { adminEntryForPath } from "../src/components/layout/admin-entry-model.ts";

const source = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("separate Google visitor schema never grants admin access", () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec("PRAGMA foreign_keys = ON");
    db.exec(source("../migrations/0001_admin_foundation.sql"));
    db.exec(source("../migrations/0002_visitor_google.sql"));
    db.prepare("INSERT INTO visitor_users(id,google_sub,email,display_name) VALUES (?,?,?,?)")
      .run("v1", "google123", "visitor@example.com", "Visitor");
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM admin_users").get().n, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM visitor_users").get().n, 1);
    db.prepare("INSERT INTO visitor_sessions(id,visitor_id,token_hash,expires_at) VALUES(?,?,?,?)")
      .run("s1", "v1", "fakehash", "2099-01-01T00:00:00Z");
    assert.throws(() => db.prepare("INSERT INTO visitor_sessions(id,visitor_id,token_hash,expires_at) VALUES(?,?,?,?)")
      .run("s2", "does-not-exist", "fakehash2", "2099-01-01T00:00:00Z"));
    assert.throws(() => db.prepare("INSERT INTO visitor_users(id,google_sub,email,display_name) VALUES(?,?,?,?)")
      .run("v2", "google123", "other@example.com", "Other"));
  } finally { db.close(); }
});

test("public sign-in goes to visitors while management stays separate", () => {
  assert.equal(adminEntryForPath("/", false).href, "/login");
  assert.equal(adminEntryForPath("/events", true).href, "/login");
  assert.equal(adminEntryForPath("/admin/login", false).href, "/admin/login");
  assert.equal(adminEntryForPath("/admin/events", false).href, "/admin");
});

test("Google callback uses distinct cookie and visitor session, never admin session", () => {
  const google = source("../src/features/visitors/server/google-auth.ts");
  assert.match(google, /naga_visitor_session/);
  assert.match(google, /naga_visitor_oauth_state/);
  assert.match(google, /visitor_sessions/);
  assert.doesNotMatch(google, /INSERT INTO admin_users|INSERT INTO admin_sessions/);
  const callback = source("../src/app/api/visitor/google/callback/route.ts");
  assert.match(callback, /verifiedGoogleProfile/);
  assert.match(callback, /sessionForVerifiedGoogleVisitor/);
  assert.doesNotMatch(callback, /createSessionForGoogle/);
  const adminCallback = source("../src/app/api/auth/callback/google/route.ts");
  assert.match(adminCallback, /createSessionForGoogle/);
});

test("visitor signup exposes Google only and no open password endpoints", () => {
  const login = source("../src/app/login/page.tsx");
  const signup = source("../src/app/signup/page.tsx");
  assert.match(login, /\/api\/visitor\/google\/start/);
  assert.match(signup, /\/api\/visitor\/google\/start/);
  assert.doesNotMatch(login, /<form/);
  assert.doesNotMatch(signup, /<form/);
  assert.doesNotMatch(source("../migrations/0002_visitor_google.sql"), /password_hash/);
  const logout = source("../src/app/api/visitor/logout/route.ts");
  assert.match(logout, /request.headers.get\("origin"\)/);
});

test("Google OAuth callback path parameter matches visitor route", () => {
  const adminAuth = source("../src/features/admin/server/auth.ts");
  assert.match(adminAuth, /callbackPath = "\/api\/auth\/callback\/google"/);
  assert.match(adminAuth, /const callbackUrl = `\$\{origin\}\$\{callbackPath\}`/);
  assert.match(adminAuth, /redirect_uri: `\$\{new URL\(requestUrl\)\.origin\}\$\{callbackPath\}`/);
});

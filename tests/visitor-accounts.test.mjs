import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import {
  hashPassword, verifyPassword, normalizeVisitorEmail, cleanVisitorName,
  isAcceptablePassword, PASSWORD_ITERATIONS,
} from "../src/features/visitors/domain/password.ts";
import { adminEntryForPath } from "../src/components/layout/admin-entry-model.ts";

test("passwords are salted and stretched to a strong work factor", async () => {
  const password = "long-unpredictable-passphrase-123";
  const first = await hashPassword(password);
  const second = await hashPassword(password);
  assert.notEqual(first, second);
  assert.match(first, /^pbkdf2-sha256\$600000\$/);
  assert.equal(PASSWORD_ITERATIONS, 600000);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword("some-other-secret-phrase", first), false);
  assert.equal(await verifyPassword(password, "invalid"), false);
});

test("visitor email and password inputs have bounded lengths", () => {
  assert.equal(normalizeVisitorEmail(" Person@Example.COM "), "person@example.com");
  assert.equal(normalizeVisitorEmail("bad@@domain.test"), null);
  assert.equal(normalizeVisitorEmail("not-an-email"), null);
  assert.equal(cleanVisitorName("  اختبار  نون  "), "اختبار نون");
  assert.equal(cleanVisitorName("x"), null);
  assert.equal(isAcceptablePassword("short"), false);
  assert.equal(isAcceptablePassword("a".repeat(15)), true);
  assert.equal(isAcceptablePassword("a".repeat(129)), false);
});

test("visitor tables cannot grant admin rights", () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec(readFileSync(new URL("../migrations/0001_admin_foundation.sql", import.meta.url), "utf8"));
    db.exec(readFileSync(new URL("../migrations/0002_visitor_accounts.sql", import.meta.url), "utf8"));
    db.prepare("INSERT INTO visitor_users(id,email,display_name,password_hash) VALUES (?,?,?,?)")
      .run("visitor-1", "somebody@example.com", "Visitor", "not-a-real-hash");
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM admin_users").get().n, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM visitor_users").get().n, 1);
    assert.throws(() => db.prepare("INSERT INTO visitor_sessions(id,visitor_id,token_hash,expires_at) VALUES (?,?,?,?)")
      .run("sess-1","missing","hash","2099-01-01T00:00:00Z"));
  } finally { db.close(); }
});

test("public login points to visitor identity and admin stays separate", () => {
  assert.equal(adminEntryForPath("/", false).href, "/login");
  assert.equal(adminEntryForPath("/events", true).href, "/login");
  assert.equal(adminEntryForPath("/admin/login", false).href, "/admin/login");
  assert.equal(adminEntryForPath("/admin/events", false).href, "/admin");
  const visitorAuth = readFileSync(new URL("../src/features/visitors/server/auth.ts", import.meta.url), "utf8");
  assert.match(visitorAuth, /naga_visitor_session/);
  assert.match(visitorAuth, /visitor_sessions/);
  assert.doesNotMatch(visitorAuth, /INSERT INTO admin_users|INSERT INTO admin_sessions/);
  const route = readFileSync(new URL("../src/app/api/visitor/google/callback/route.ts", import.meta.url), "utf8");
  assert.match(route, /loginVisitorByGoogle/);
  assert.doesNotMatch(route, /createSessionForGoogle/);
});

test("all credential writes require same-origin forms", () => {
  const form = readFileSync(new URL("../src/features/visitors/server/form.ts", import.meta.url), "utf8");
  assert.match(form, /request.headers.get\("origin"\)/);
  assert.match(form, /total > 4096/);
  for (const name of ["register","login"]) {
    const route = readFileSync(new URL(`../src/app/api/visitor/${name}/route.ts`, import.meta.url), "utf8");
    assert.match(route, /visitorFormOriginAllowed/);
    assert.match(route, /consumeVisitorRateLimit/);
  }
});

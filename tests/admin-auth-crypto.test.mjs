import { test } from "node:test";
import assert from "node:assert/strict";
import { randomToken, sha256, sealOAuthState, openOAuthState } from "../src/features/admin/server/crypto.ts";

const secret = "s".repeat(44);

test("opaque session tokens use CSPRNG and are URL safe", () => {
  const a = randomToken();
  const b = randomToken();
  assert.match(a, /^[a-zA-Z0-9_-]{43}$/);
  assert.notEqual(a, b);
});

test("PKCE and session hashes are stable, not the original token", async () => {
  const v = randomToken();
  assert.equal(await sha256(v), await sha256(v));
  assert.notEqual(await sha256(v), v);
  assert.match(await sha256(v), /^[a-zA-Z0-9_-]{43}$/);
});

test("signed OAuth state verifies within a 10-minute window", async () => {
  const now = Date.now();
  const state = { state: randomToken(), verifier: randomToken(), issuedAt: now };
  const cookie = await sealOAuthState(state, secret);
  assert.deepEqual(await openOAuthState(cookie, secret, now + 599000), state);
  assert.equal(await openOAuthState(cookie, secret, now + 601000), null);
});

test("invalid signatures, malformed state, and future issuance fail closed", async () => {
  const now = Date.now();
  const cookie = await sealOAuthState({ state: randomToken(), verifier: randomToken(), issuedAt: now }, secret);
  assert.equal(await openOAuthState(cookie + "x", secret), null);
  assert.equal(await openOAuthState(cookie, "wrong"), null);
  assert.equal(await openOAuthState("invalid", secret), null);
  assert.equal(await openOAuthState(cookie, secret, now - 40000), null);
});

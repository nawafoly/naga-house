# NAGA HOUSE — Visitor identity (staged, not production-ready)

## Product behavior
- Public header **تسجيل الدخول** points to `/login`; `/signup` creates a visitor account; `/account` is authenticated.
- Visitors can use Google OAuth or email + password. Admins keep their **separate** `/admin/login` and verified Google-only access, with unchanged admin permissions.
- Password accounts are marked **email unverified**. Google-proven accounts are marked verified. Accounts matching an email from a different provider are **not auto-linked** (prevents a pre-registered unverified email from taking over Google account data).
- 15-character minimum password, PBKDF2-SHA256 with per-user random salt and 600,000 iterations, opaque hashed session tokens, HttpOnly SameSite cookies, same-origin POST, server-side rate limits.
- No R2, no mail sending subscription and no extra Worker bindings.

## Migrations (NOT automatic, only on explicit review)
1. Apply `migrations/0002_visitor_accounts.sql` **locally** to a D1 copy and test rollback/snapshots.
2. For staging ONLY, after backup and approval: `npx cf d1 execute naga-house-staging-db --remote --file=migrations/0002_visitor_accounts.sql`. Verify command syntax for your installed cf CLI before running.
3. Deploy staging branch only after CI and migration; test login, logout, signup, Google and admin isolation.
4. Leave production untouched until email ownership/recovery, abusive signups, and Workers Free CPU benchmarks are resolved.

## Google OAuth setup
Existing admin OAuth uses `/api/auth/callback/google`. Visitor OAuth uses an **additional** callback:
`https://naga-house-staging.nagahouse3.workers.dev/api/visitor/google/callback`
Add it to the current OAuth client Authorized redirect URIs in Google Cloud Console before testing; do not remove the admin callback. Configure a separate production callback when ready.

## Launch blockers, transparent limitations
- **Email verification:** The app does not yet send a verification email or password-reset link; therefore manually registered email addresses cannot be proven or safely recovered. Do not enable email-based visitor accounts publicly before a reliable no-fee mail solution or an alternate verification design is in place.
- **Workers Free CPU:** Worker budget is 10 ms per request. PBKDF2 600k is expensive and must be benchmarked in staging before enabling password signup/login on Free. Do not weaken password hashing solely to meet budget; prefer an identity provider with a no-credit-card free tier if needed.
- **Rate limiting:** D1 limiter is a useful baseline, not a replacement for bot protection, email verification, or Cloudflare Turnstile. Review attack controls before public launch; implement TTL maintenance for limiter rows.
- **Recovery & linking:** No password reset and no password↔Google account linking yet. Avoid high-trust actions until verified.
- **Costs:** Workers/D1 Free are quota-bound, and this code creates no new billing service. Check the actual Cloudflare plan separately.
- **Migration must precede staging deploy** (otherwise account routes fail gracefully with service errors). Never run migrations automatically in CI or prod.

Security references: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html and https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

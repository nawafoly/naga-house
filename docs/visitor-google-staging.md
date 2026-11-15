# NAGA HOUSE — Google-only visitors on staging (FREE tier)

This is a deliberately separate follow-up to draft PR #22. Email/password routes are **not shipped** by this small PR. They need email ownership verification, reset flows, and cost/security review first.

## Authentication boundaries

- `/login`: Google-only visitor entry; `/signup`: same trusted Google signup.
- `/account`: visitor profile and logout. Visitor sessions are stored separately in D1 and cannot grant admin access.
- `/admin/login`: existing Google-only admin session remains unchanged and requires the authorized admin identity.
- Visitors use separate signed OAuth state cookie and a seven-day, HttpOnly, SameSite, Secure-on-HTTPS session cookie. Only session token hashes are stored.
- Google `email_verified` and immutable `sub` are checked via existing server-side UserInfo flow. Matching email alone is not sufficient to link accounts.
- No R2, email delivery, paid auth provider, or new secret binding.

## Verification and rollout

**Hold this PR as draft until manual Staging checks and D1 backup are verified. Do not deploy to Production or enable paid services.**

1. Review and confirm Cloudflare Workers/D1 account is on Free plan.
2. In Google Cloud Console -> Google Auth Platform -> Clients -> existing OAuth client, add **exactly** this new Authorized redirect URI (do not remove existing admin URI):
   `https://naga-house-staging.nagahouse3.workers.dev/api/visitor/google/callback`
   Google documentation: https://developers.google.com/identity/openid-connect/openid-connect
3. Apply `migrations/0002_visitor_google.sql` to an isolated local D1 test database first. Do not overwrite the admin foundation schema. Test user and session constraints.
4. Export a verified backup of the **STAGING** D1 database before any remote write. Cloudflare D1 offers export via Wrangler (`wrangler d1 export`), but verify your installed CLI/permissions and exact database selection before running.
5. After backup and explicit review, run the new migration **only** on `naga-house-staging-db`. A staging deploy itself does not create DB tables.
6. Deploy the branch to **Staging only** with `npm run deploy:staging`. Confirm the deployment targets `naga-house-staging`.
7. Check /login -> Google consent -> /account and /api/visitor/logout. Verify no admin privileges, no unexpected auto-linking, cookies secure, redirects correct and no public email registration form.
8. Do not merge to main until all stages pass. A future production release needs separate callback registration and review.

## Cost and security notes

- Google sign-in does not need a paid mail delivery provider; Workers/D1 Free quotas must still be respected. Do not enable a Paid plan.
- Google consent screen should be in testing mode as appropriate, with test users authorized. Setup may require Google console action.
- This PR does not have a visitor-wide bot challenge, abuse monitoring or account deletion interface. Limit Staging tests to trusted accounts only before production planning.
- PR #22 must later be rebased or reconciled with this smaller implementation. Its old migration `0002_visitor_accounts.sql` is **not compatible** with this new schema. Do not apply both.

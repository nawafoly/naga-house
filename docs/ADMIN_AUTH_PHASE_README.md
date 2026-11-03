# NAGA HOUSE — Admin Auth, Phase 1

## What this patch adds
- Google authorization-code OAuth with PKCE S256 and HMAC-signed, 10-minute CSRF state cookie.
- Server-to-server Google token exchange and HTTPS UserInfo retrieval (verified email + Google `sub`).
- First-owner bootstrap only if the D1 `admin_users` table is empty AND the verified account matches `ADMIN_BOOTSTRAP_EMAIL`.
- D1-backed opaque session tokens (only SHA-256 hashes in DB), 7-day HTTP-only SameSite=Lax cookies, revocation on logout.
- Protected `/admin` and `/admin/events` server-rendered read-only dashboard.
- No permission is granted merely for being a Google OAuth test user. Existing admins must match their stored Google `sub` and email AND be active.

## Security and scope
- No production migration, deployment, or changes to `main`.
- The existing published event catalog is unchanged. D1 events and static curated events are deliberately separate for now.
- No secrets belong in Git, screenshots, or chat. `.env.local` is already ignored by `.gitignore`.
- The `AUTH_SECRET` must remain stable across restarts; changing it invalidates pending OAuth states. D1 sessions have independent random tokens.
- Before deploying, configure `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`, and `ADMIN_BOOTSTRAP_EMAIL` as server-side Cloudflare Worker secrets/vars. Add the production OAuth redirect URI in Google Cloud. **Do not deploy before testing locally.**
- The owner bootstrap triggers only when no admin exists and a verified Google account matches the allowlisted email; there is no open self-registration endpoint.

## Local setup

1. Make sure you're on `feat/admin-foundation`, and `git status --short` is clean before extracting.
2. Extract patch ZIP to the project root with `Expand-Archive ... -DestinationPath '.' -Force`.
3. `.env.local` already contains `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`. Append a fourth line with **your** real Google test-user/admin address:

   `ADMIN_BOOTSTRAP_EMAIL=the-address-you-added-to-Google-test-users@example.com`

   Don't add quote marks or a trailing space. Don't paste or display this file in chat.
4. Crucial: `cf d1 migrations apply --local` from the previous session stored state at the Cloudflare CLI global default path. Vinext's Cloudflare Vite plugin uses `.cloudflare/state` by default. Run this once to initialize the local DB used **by Vinext**:

   `npx cf d1 migrations apply 38587d26-d654-48f2-89a4-f8cf667d0ee8 --local --persist-to .cloudflare/state`

   Carefully keep `--local` and `--persist-to`. No production D1 mutation.
5. Run `node --experimental-strip-types --test tests/admin-auth-crypto.test.mjs`, `npm run lint`, and `npm run build:vinext`.
6. Start on registered Google OAuth origin `http://localhost:3000` (not the default 3001):

   `npm run dev:vinext -- --port 3000`

   Go to `http://localhost:3000/admin/login`; if the Google account is allowlisted, OAuth creates first owner on the local D1, then redirects to `/admin`. Test logout and page guard using a private browsing window.

## Troubleshooting
- `NAGA_D1_UNAVAILABLE` / callback error `server`: check local D1 binding, schema and `.cloudflare/state` path. Run local migration command above, restart Vite.
- Google `redirect_uri_mismatch`: the browser must use `localhost:3000`, not `127.0.0.1:3000` or `localhost:3001`. The Google client must have `http://localhost:3000/api/auth/callback/google` registered.
- Login error `access`: `ADMIN_BOOTSTRAP_EMAIL` must exactly match the verified Google test user; if a different owner has already been created locally, don't delete records blindly.
- Login error `config`: verify secret names; never print their values.
- Keep `npm run dev` (Next's Node server) separate from `npm run dev:vinext` (Cloudflare runtime with D1). Use Vinext for the auth test.

## Before commit / push
Run `git diff --check`, `git status --short`, and verify that `.env.local` and `.cloudflare/state` remain ignored. Don't push until local auth is proven end to end and user requests it.

# NAGA HOUSE — Admin Events Phase 2A: Create Local D1 Drafts

## Scope
- Adds `/admin/events/new` (Arabic RTL HTML form) and `POST /api/admin/events`.
- Requires valid server-side D1 admin session; browser submissions require an exact same-origin `Origin` header.
- Restricts creation to `draft` status and `featured=0`. No publish/update/delete actions in this phase.
- Writes `events` and `admin_audit_logs` in a single atomic D1 batch. No new migration.
- Validates event fields, Saudi-local input date converted to UTC ISO, allowed category, trusted external ticket provider and canonical existing `isTrustedTicketUrl` validation.
- Image URLs are currently limited to `https://images.unsplash.com/...` as a temporary safe milestone until R2 media upload is implemented.
- Does not change the public event repository: published pages continue to use curated source files, not D1.
- Local-only testing; **do not migrate remote D1, deploy, or merge into `main`**.

## Testing
1. Apply the ZIP to a clean `feat/admin-foundation` working tree; no secrets or runtime artifacts are included.
2. Run `node --experimental-strip-types --test tests/admin-event-draft.test.mjs`.
3. Run `npm run lint` and `npm run build:vinext` after confirming available disk space.
4. Keep `.dev.vars`, `.env.local`, and `.cloudflare/state` untouched. Start `npx vite dev --port 3000`.
5. Sign in with Google owner account, go to `/admin/events/new`, use a nonproduction example and submit.
6. Expect redirect to `/admin/events?created=1`, row marked `مسودة`, dashboard draft count +1.
7. Verify signed-out POST receives 401; POST from a foreign origin receives 403; invalid ticket domain does not create a row.
8. Verify `admin_audit_logs` has the new `event.create` record (local database only).

## Known limits
- First slice has no editing, publishing, deleting, R2 uploading, or public-site synchronization.
- Redirect-based form validation does not retain invalid values after failed submission.
- Server does not add rate limiting yet; the same-origin and authenticated session checks protect creation but should be supplemented before production.

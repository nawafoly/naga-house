# NAGA HOUSE — Event Draft Form Diagnostics (local-only)

- Improves the existing create-draft form; adds no new npm dependencies or database migrations.
- Keeps an authenticated user’s typed form fields on validation or D1 failure instead of reloading the page.
- Returns localized, per-field errors for invalid values; client highlights those fields; URL ticket-host vs provider mismatch gets a specific hint.
- Server-side session, same-origin, content-type, `draft` status, D1 transactional insert, and audit log remain enforced. This does not enable publishing or editing.
- Still requires `https://images.unsplash.com/...` for image URLs; R2 upload is a later phase.
- Test and lint before committing. No production D1 mutation.

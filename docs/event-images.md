# Event images without an R2 subscription

NAGA HOUSE can use **repository-hosted static images** instead of a billable image storage subscription.

## Adding an image

1. Choose an image you have permission to publish. Crop and compress it locally (ideally WebP).
2. Add it to `public/event-images/` in this repository. Create the folder if it does not exist.
3. Name the file with lowercase English letters, numbers and hyphens only, for example `jeddah-comedy-2026.webp`. Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`.
4. Commit the image in a separate PR and deploy it to **Staging** before assigning its URL to an event.
5. Verify `https://naga-house-staging.nagahouse3.workers.dev/event-images/jeddah-comedy-2026.webp` loads correctly, then enter `/event-images/jeddah-comedy-2026.webp` in the event's image field.
6. When releasing to production, deploy the same committed asset before publishing the event using it.

Existing `https://images.unsplash.com/...` references remain supported.

## Known limitations

- This is **not** browser-to-server image upload. Adding or replacing an image requires a reviewed repository commit and deployment.
- Event image validation accepts only a safe path format; it does not check that the referenced file exists. Always verify the image URL before publishing.
- Cloudflare Workers Static Assets have no additional storage charge and static asset requests are free, subject to provider limits and account plan. Unlike R2, this path does not require adding a usage-billed storage subscription.
- Site pages, API requests and image transformations from other URLs may still have their own Cloudflare plan limits. This change does **not** guarantee other products have no fees.
- Local images bypass image transformations and are routed directly to static assets for predictable serving; optimize files before committing.
- Use unique filenames when replacing images to avoid browser caching issues.
- Do not put secrets, credentials, or private images in the public directory.

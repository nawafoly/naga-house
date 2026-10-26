import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "naga-house",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-21",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      DB: bindings.d1({ name: "naga-house-db", id: "38587d26-d654-48f2-89a4-f8cf667d0ee8" }),
      // Required server-only OAuth secrets. Values come from .dev.vars locally.
      // Never place secret values in this committed config file.
      AUTH_GOOGLE_ID: bindings.secret(),
      AUTH_GOOGLE_SECRET: bindings.secret(),
      AUTH_SECRET: bindings.secret(),
      ADMIN_BOOTSTRAP_EMAIL: bindings.secret(),
    },
  }),
});

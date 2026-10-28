import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig(({ mode }) => {
  const isStaging = mode === "staging";

  return {
    worker: defineWorker({
      name: isStaging ? "naga-house-staging" : "naga-house",

      entrypoint: "vinext/server/fetch-handler",

      compatibilityDate: "2026-10-21",

      compatibilityFlags: ["nodejs_compat"],

      assets: {
        htmlHandling: "none",
        notFoundHandling: "none",
        runWorkerFirst: [
          "/*",
          "!/_next/static/*",
          "!/*/_next/static/*",
        ],
      },

      env: {
        ASSETS: bindings.assets(),

        IMAGES: bindings.images(),

        DB: bindings.d1(
          isStaging
            ? {
                name: "naga-house-staging-db",
                id: "4decfc60-ef14-4199-bed2-d74624e083a9",
              }
            : {
                name: "naga-house-db",
                id: "38587d26-d654-48f2-89a4-f8cf667d0ee8",
              }
        ),

        AUTH_GOOGLE_ID: bindings.secret(),
        AUTH_GOOGLE_SECRET: bindings.secret(),
        AUTH_SECRET: bindings.secret(),
        ADMIN_BOOTSTRAP_EMAIL: bindings.secret(),
      },
    }),
  };
});
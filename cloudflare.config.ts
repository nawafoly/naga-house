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
          "!/event-images/*",
        ],
      },

      env: {
        ASSETS: bindings.assets(),

        IMAGES: bindings.images(),

        DB: bindings.d1(
          isStaging
            ? {
                name: "naga-house-staging-db",
                id: "403eb830-9185-46d3-96eb-d004e0fb563d",
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
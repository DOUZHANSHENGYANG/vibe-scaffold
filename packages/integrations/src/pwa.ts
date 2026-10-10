import { contribute, defineAddon, packageJson } from "@vibe-scaffold/core";

import { spaVitePlugins } from "#/spa.ts";
import { agentsConventions, readmeLayers } from "#/vite-plus/slots.ts";

export const pwa = defineAddon({
  contribute: (ctx) => [
    contribute(spaVitePlugins, {
      name: "VitePWA",
      specifier: "vite-plugin-pwa",
      init: `VitePWA({
        registerType: "auto-update",
        manifest: {
          name: "${ctx.name}",
          short_name: "${ctx.name}",
          theme_color: "#0f172a",
          background_color: "#0f172a",
          display: "standalone",
          icons: [],
        },
      })`,
    }),
    contribute(packageJson, {
      devDependencies: ["vite-plugin-pwa"],
      path: ".",
    }),
    contribute(agentsConventions, {
      text: `The app is an installable PWA: \`vite-plugin-pwa\` registers an auto-updating service worker through the \`plugins\` entry in \`vite.config.ts\`, and the manifest carries the app name. Generate the icon set (192px, 512px, and a maskable 512px PNG) with a tool like \`pwa-asset-generator\`, put them in \`apps/web/public\`, and list them under \`manifest.icons\` in \`vite.config.ts\` — an empty \`icons\` array ships fine but installs without a badge. Test the install flow from a build (\`vp run build && vp preview\`), not from the dev server.`,
      title: "PWA",
    }),
    contribute(readmeLayers, {
      choice:
        "PWA (installable, auto-updating service worker through vite-plugin-pwa)",
      layer: "Deployment",
    }),
  ],
  default: false,
  description:
    "Makes the web app installable: auto-updating service worker and web manifest through vite-plugin-pwa",
  homepage: "https://vite-pwa-org.netlify.app",
  id: "pwa",
  name: "PWA",
  supportsAdd: true,
});

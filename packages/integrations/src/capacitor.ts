import {
  contribute,
  defineIntegration,
  packageJson,
  renderFile,
  setupCommand,
} from "@vibe-scaffold/core";

import { knipIgnores } from "#/knip.ts";
import {
  agentsMap,
  agentsNotes,
  readmeLayers,
  readmeOpen,
  readmeTagline,
} from "#/vite-plus/slots.ts";

const architecture = `The mobile app wraps \`apps/web\` with a Capacitor shell: \`pnpm cap:sync\` builds the web app and copies it into the native projects, \`pnpm cap:open android\` opens Android Studio (needs the Android SDK), and \`pnpm cap run android\` installs and launches on a device or emulator. The web code is the app; native features arrive as Capacitor plugins — add the npm package (\`@capacitor/preferences\` for key-value storage, for example), import it from the renderer, and \`pnpm cap:sync\` wires the native side. iOS needs macOS: \`pnpm exec cap add ios\`, then \`pnpm cap open ios\`. The \`android/\` project is yours to commit and customize like any other native project.`;

export const capacitor = defineIntegration({
  contribute: (ctx) => [
    // Capacitor rejects dashes in the App ID, so the name normalizes per platform.
    renderFile(
      "capacitor.config.json",
      () =>
        `${JSON.stringify(
          {
            appId: `com.${ctx.name.replaceAll("-", "_")}.app`,
            appName: ctx.name,
            webDir: "apps/web/dist",
          },
          null,
          2
        )}
`
    ),
    contribute(packageJson, {
      dependencies: ["@capacitor/android", "@capacitor/core"],
      path: ".",
    }),
    contribute(packageJson, {
      devDependencies: ["@capacitor/cli"],
      path: ".",
      scripts: {
        cap: "cap",
        "cap:sync": "vp build apps/web && cap sync",
      },
    }),
    // The Android project is generated from the pinned platform package, so
    // every create produces the same scaffold; commit it like the CLI says.
    contribute(setupCommand, {
      run: "pnpm exec cap add android",
      writes: ["android/**", "android/**/.*"],
    }),
    // The Android gradle build consumes the platform package; Knip cannot see it.
    contribute(knipIgnores, "@capacitor/android"),
    contribute(agentsMap, {
      owns: "The Capacitor shell: capacitor.config.json and the native android/ project",
      path: "android",
    }),
    contribute(agentsNotes, architecture),
    contribute(readmeTagline, "Capacitor"),
    contribute(readmeLayers, {
      choice:
        "Capacitor (the web app in a native Android shell), synced with pnpm cap:sync",
      layer: "Mobile",
    }),
    contribute(
      readmeOpen,
      "`pnpm cap:sync` also refreshes the Android project with a fresh web build. `pnpm cap:open android` opens Android Studio."
    ),
  ],
  id: "capacitor",
  kind: "mobile",
  name: "Capacitor",
  description: "Mobile app around the web app, packaged with Capacitor",
  homepage: "https://capacitorjs.com",
  requires: ["single-page-app"],
});

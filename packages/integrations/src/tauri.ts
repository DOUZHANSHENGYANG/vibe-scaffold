import type { Context } from "@vibe-scaffold/core";
import {
  contribute,
  defineIntegration,
  packageJson,
  setupCommand,
} from "@vibe-scaffold/core";

import { templateFiles } from "#/templates.ts";
import {
  agentsMap,
  agentsNotes,
  ignoredFiles,
  readmeLayers,
  readmeOpen,
  readmeTagline,
} from "#/vite-plus/slots.ts";

const architecture = (ctx: Context) => {
  const auth = ctx.has("better-auth")
    ? "; `packages/auth` lists both origins in `trustedOrigins`"
    : "";
  return `The desktop app wraps \`apps/web\` with a Tauri 2 Rust shell in \`src-tauri\`: \`pnpm tauri dev\` starts the web dev server (\`vp dev\`) and opens it in the Tauri window, and \`pnpm tauri build\` builds the web app and packages an installer (MSI or NSIS on Windows); both need the Rust toolchain. In production the window loads the bundled SPA at \`http://tauri.localhost\` (Windows and Linux) or \`tauri://localhost\` (macOS)${auth}. Rust commands live in \`src-tauri/src/main.rs\`, where \`greet\` shows the pattern; add \`@tauri-apps/api\` to \`apps/web\` to invoke them from the renderer. \`src-tauri/capabilities/default.json\` grants the window its permissions. Restart \`pnpm tauri dev\` after changing Rust code.`;
};

export const tauri = defineIntegration({
  contribute: (ctx) => [
    ...templateFiles(ctx, "tauri/common"),
    contribute(packageJson, {
      devDependencies: ["@tauri-apps/cli"],
      path: ".",
      scripts: { tauri: "tauri" },
    }),
    // The bundler needs real icon files; the CLI renders them from this SVG source.
    contribute(setupCommand, {
      run: "pnpm exec tauri icon src-tauri/app-icon.svg",
      writes: ["src-tauri/icons/**"],
    }),
    contribute(ignoredFiles, "src-tauri/target"),
    contribute(agentsMap, {
      owns: "The Tauri shell: Rust commands, window config, capabilities, and tauri.conf.json",
      path: "src-tauri",
    }),
    contribute(agentsNotes, architecture(ctx)),
    contribute(readmeTagline, "Tauri"),
    contribute(readmeLayers, {
      choice:
        "Tauri 2 (a Rust shell around the system WebView), packaged with the Tauri bundler",
      layer: "Desktop",
    }),
    contribute(
      readmeOpen,
      "`pnpm tauri dev` also opens the app in a Tauri window. `pnpm tauri build` writes the platform installer and needs the Rust toolchain."
    ),
  ],
  id: "tauri",
  kind: "desktop",
  name: "Tauri",
  description: "Desktop app around the web app, built with Tauri 2",
  homepage: "https://tauri.app",
  requires: ["single-page-app"],
});

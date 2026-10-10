import { z } from "zod";

import type { Context, ReadSlot } from "@vibe-scaffold/core";
import {
  contribute,
  defineIntegration,
  defineSlot,
  packageJson,
  renderFile,
  setupCommand,
} from "@vibe-scaffold/core";

import { templateContent, templateFiles } from "#/templates.ts";
import {
  agentsMap,
  agentsNotes,
  ignoredFiles,
  readmeLayers,
  readmeOpen,
  readmeTagline,
} from "#/vite-plus/slots.ts";

/** A Tauri plugin another integration adds: its Cargo dependency, builder call, and capability. */
export interface TauriPlugin {
  readonly cargo?: string;
  readonly init?: string;
  readonly permission?: string;
}

/** Plugins other integrations contribute; rendered into the shell's Cargo manifest, builder, and capabilities. */
export const tauriPlugin = defineSlot<TauriPlugin>("tauri/plugin");

/** Window options another integration adjusts: the main window's native decorations. */
export interface TauriWindow {
  readonly decorations?: boolean;
}

/** Window settings other integrations contribute; rendered into tauri.conf.json's main window. */
export const tauriWindow = defineSlot<TauriWindow>("tauri/window");

// The conf's keys stay in this order through the parse, so the rendered file
// keeps the template's layout.
const confSchema = z.looseObject({
  $schema: z.string(),
  productName: z.string(),
  version: z.string(),
  identifier: z.string(),
  build: z.looseObject({}),
  app: z.looseObject({
    windows: z.array(z.looseObject({})),
  }),
  bundle: z.looseObject({}),
});

const architecture = (ctx: Context) => {
  const auth = ctx.has("better-auth")
    ? "; `packages/auth` lists both origins in `trustedOrigins`"
    : "";
  return `The desktop app wraps \`apps/web\` with a Tauri 2 Rust shell in \`src-tauri\`: \`pnpm tauri dev\` starts the web dev server (\`vp dev\`) and opens it in the Tauri window, and \`pnpm tauri build\` builds the web app and packages an installer (MSI or NSIS on Windows); both need the Rust toolchain. In production the window loads the bundled SPA at \`http://tauri.localhost\` (Windows and Linux) or \`tauri://localhost\` (macOS)${auth}. Rust commands live in \`src-tauri/src/main.rs\`, where \`greet\` shows the pattern; add \`@tauri-apps/api\` to \`apps/web\` to invoke them from the renderer. \`src-tauri/capabilities/default.json\` grants the window its permissions. Restart \`pnpm tauri dev\` after changing Rust code.`;
};

const cargoToml = (ctx: Context, read: ReadSlot) =>
  [
    "[package]",
    `name = "${ctx.name}"`,
    'version = "0.1.0"',
    'edition = "2021"',
    "",
    "[build-dependencies]",
    'tauri-build = { version = "2", features = [] }',
    "",
    "[dependencies]",
    'serde = { version = "1", features = ["derive"] }',
    'serde_json = "1"',
    'tauri = { version = "2", features = [] }',
    ...read(tauriPlugin).flatMap((plugin) => plugin.cargo ?? []),
    "",
    "[profile.release]",
    "codegen-units = 1",
    "lto = true",
    'opt-level = "s"',
    'panic = "abort"',
    "strip = true",
    "",
  ].join("\n");

const mainRs = (read: ReadSlot) =>
  [
    "// Prevents an additional console window on Windows in release builds.",
    '#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]',
    "",
    "/// The pattern for app commands: take typed args, return a typed value.",
    "#[tauri::command]",
    "fn greet(name: &str) -> String {",
    '    format!("Hello, {name}! You have been greeted from Rust.")',
    "}",
    "",
    "fn main() {",
    "    tauri::Builder::default()",
    ...read(tauriPlugin).flatMap((plugin) =>
      plugin.init === undefined ? [] : [`        ${plugin.init}`]
    ),
    "        .invoke_handler(tauri::generate_handler![greet])",
    "        .run(tauri::generate_context!())",
    '        .expect("error while running the tauri application");',
    "}",
    "",
  ].join("\n");

const capabilitiesJson = (read: ReadSlot) =>
  `${JSON.stringify(
    {
      $schema: "../gen/schemas/desktop-schema.json",
      identifier: "default",
      windows: ["main"],
      permissions: [
        "core:default",
        ...read(tauriPlugin).flatMap((plugin) => plugin.permission ?? []),
      ],
    },
    null,
    2
  )}\n`;

export const tauri = defineIntegration({
  contribute: (ctx) => [
    ...templateFiles(ctx, "tauri/common", {
      except: ["src-tauri/tauri.conf.json"],
    }),
    renderFile("src-tauri/Cargo.toml", (read) => cargoToml(ctx, read)),
    renderFile("src-tauri/src/main.rs", (read) => mainRs(read)),
    renderFile("src-tauri/capabilities/default.json", (read) =>
      capabilitiesJson(read)
    ),
    // The conf's window block comes from the tauriWindow slot, so an add-on
    // can turn the native decorations off for its own titlebar.
    renderFile("src-tauri/tauri.conf.json", (read) => {
      const windows = read(tauriWindow);
      const decorations =
        windows.find((window) => window.decorations !== undefined)
          ?.decorations ?? true;
      const conf = confSchema.parse(
        JSON.parse(
          templateContent(ctx, "tauri/common", "src-tauri/tauri.conf.json")
        )
      );
      conf.app.windows[0] = { ...conf.app.windows[0], decorations };
      return `${JSON.stringify(conf, null, 2)}\n`;
    }),
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

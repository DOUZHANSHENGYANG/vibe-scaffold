import {
  contribute,
  defineAddon,
  packageJson,
  setupCommand,
} from "@vibe-scaffold/core";

import { hasWebApp } from "#/app.ts";
import { spaVitePlugins } from "#/spa.ts";
import { tauriPlugin } from "#/tauri.ts";
import { templateFiles } from "#/templates.ts";
import {
  agentsConventions,
  agentsMap,
  generatedFiles,
  readmeLayers,
} from "#/vite-plus/slots.ts";

// The application shell: the pieces every app rewrites before its first
// feature — i18n, a settings page with a sidebar of sections, the diffusion
// theme switch, and the in-window titlebar for Tauri.
export const appShell = defineAddon({
  // The shell is the web app's chrome; a backend-only stack has none of it.
  contribute: (ctx) => {
    if (!hasWebApp(ctx)) {
      return [];
    }
    return [
      ...templateFiles(ctx, "app-shell/common", {
        except: ctx.has("tauri")
          ? [
              "apps/web/src/components/settings/data-section.tsx",
              "apps/web/src/lib/window.ts",
            ]
          : [],
      }),
      ...(ctx.has("tauri") ? templateFiles(ctx, "app-shell/tauri") : []),
      // paraglide compiles the messages into src/paraglide during the setup step
      // below and recompiles on every dev or build through this plugin.
      contribute(spaVitePlugins, {
        init: `paraglideVitePlugin({
          project: \`\${import.meta.dirname}/project.inlang\`,
          outdir: \`\${import.meta.dirname}/src/paraglide\`,
          strategy: ["localStorage", "preferredLanguage", "baseLocale"],
          outputStructure: "locale-modules",
          emitTsDeclarations: true,
          emitGitIgnore: false,
        })`,
        name: "paraglideVitePlugin",
        specifier: "@inlang/paraglide-js",
      }),
      contribute(setupCommand, {
        run: "pnpm --dir apps/web exec paraglide-js compile --project ./project.inlang --outdir ./src/paraglide --emit-ts-declarations",
        writes: ["apps/web/src/paraglide/**"],
      }),
      contribute(packageJson, {
        devDependencies: ["@inlang/paraglide-js"],
        path: "apps/web",
      }),
      contribute(packageJson, {
        dependencies: ["gsap"],
        path: "apps/web",
      }),
      ...(ctx.has("tauri")
        ? [
            contribute(tauriPlugin, {
              permission: "core:window:allow-minimize",
            }),
            contribute(tauriPlugin, {
              permission: "core:window:allow-toggle-maximize",
            }),
            contribute(tauriPlugin, { permission: "core:window:allow-close" }),
            contribute(tauriPlugin, {
              permission: "core:window:allow-start-dragging",
            }),
            contribute(tauriPlugin, {
              cargo: 'tauri-plugin-dialog = "2"',
              init: ".plugin(tauri_plugin_dialog::init())",
              permission: "dialog:default",
            }),
            contribute(packageJson, {
              dependencies: ["@tauri-apps/api", "@tauri-apps/plugin-dialog"],
              path: "apps/web",
            }),
          ]
        : []),
      // The paraglide output is generated code: excluded from formatting and linting.
      contribute(generatedFiles, { glob: "apps/web/src/paraglide/**" }),
      contribute(agentsMap, {
        owns: "The app shell: the settings page, the i18n messages, the theme switch, and the titlebar",
        path: "apps/web/src",
      }),
      contribute(agentsConventions, {
        text: `User-facing text lives in \`apps/web/messages/{en,zh}.json\`; a component reads it as \`m.message_name()\` from \`#/paraglide/messages.js\`, and paraglide recompiles on the next dev or build. Mount \`<Titlebar />\` at the top of \`__root.tsx\`'s layout when the app runs in Tauri — it draws the drag region and window controls in place of the native titlebar. New pages follow \`routes/settings.tsx\`: sections on a left rail through \`SettingsShell\`.`,
        title: "App shell",
      }),
      contribute(readmeLayers, {
        choice:
          "App shell: settings page with section sidebar, en/zh through paraglide, the diffusion theme switch, and the in-window titlebar",
        layer: "Shell",
      }),
    ];
  },
  default: true,
  description:
    "The shared application shell: a settings page with a section sidebar, en/zh i18n through paraglide, the diffusion theme switch, and the in-window titlebar",
  id: "app-shell",
  name: "App shell",
  supportsAdd: true,
});

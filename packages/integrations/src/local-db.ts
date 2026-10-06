import { contribute, defineAddon, packageJson } from "@vibe-scaffold/core";

import { tauriPlugin } from "#/tauri.ts";
import { templateFiles } from "#/templates.ts";
import { agentsConventions, agentsMap } from "#/vite-plus/slots.ts";

export const localDb = defineAddon({
  contribute: (ctx) => [
    ...templateFiles(ctx, "local-db/common"),
    ...templateFiles(ctx, ctx.has("tauri") ? "local-db/tauri" : "local-db/web"),
    contribute(packageJson, {
      dependencies: ctx.has("tauri")
        ? ["@tauri-apps/plugin-sql", "idb"]
        : ["idb"],
      path: "apps/web",
    }),
    ...(ctx.has("tauri")
      ? [
          contribute(tauriPlugin, {
            cargo:
              'tauri-plugin-sql = { version = "2", features = ["sqlite"] }',
            init: ".plugin(tauri_plugin_sql::Builder::default().build())",
            permission: "sql:default",
          }),
        ]
      : []),
    contribute(agentsMap, {
      owns: "The local database module (`db`) and the local-storage demo card",
      path: "apps/web/src/lib",
    }),
    contribute(agentsConventions, {
      text: "Local persistence goes through `apps/web/src/lib/db.ts` (`db.get/set/delete/entries`), a namespaced key-value store backed by IndexedDB in the browser and SQLite through the Tauri SQL plugin inside Tauri; the backend is picked at runtime, so the same calls run in both. For relational queries on the desktop, call `@tauri-apps/plugin-sql` from a module under `apps/web/src/lib` and keep that module's SQL in it.",
      title: "Local database",
    }),
  ],
  default: false,
  description:
    "A unified local key-value store: IndexedDB in the browser, SQLite through the Tauri SQL plugin on desktop",
  id: "local-db",
  name: "Local database",
  supportsAdd: true,
});

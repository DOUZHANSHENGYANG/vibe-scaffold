import {
  contribute,
  defineAddon,
  defineSlot,
  packageJson,
  renderFile,
} from "@vibe-scaffold/core";

import { readySteps, toolConventions } from "#/vite-plus/slots.ts";

export const knipEntries = defineSlot<{
  readonly workspace: string;
  readonly entry: readonly string[];
}>("knip/entries");

/** Dependencies a native build or config consumes, invisible to Knip's import graph. */
export const knipIgnores = defineSlot<string>("knip/ignore-dependencies");

export const knip = defineAddon({
  supportsAdd: true,
  contribute: () => [
    renderFile("knip.json", (read) => {
      const entries = read(knipEntries);
      const ignores = read(knipIgnores);
      const workspaces: Record<
        string,
        { entry?: readonly string[]; ignoreDependencies?: readonly string[] }
      > = Object.fromEntries(
        entries.map(({ workspace, entry }) => [workspace, { entry }])
      );
      if (ignores.length > 0) {
        workspaces["."] = {
          ...workspaces["."],
          ignoreDependencies: [...ignores],
        };
      }
      return `${JSON.stringify(
        {
          $schema: "https://unpkg.com/knip@6/schema.json",
          workspaces,
        },
        null,
        2
      )}\n`;
    }),
    contribute(packageJson, {
      devDependencies: ["knip"],
      path: ".",
      scripts: { knip: "knip" },
    }),
    contribute(readySteps, {
      command: "vp run knip",
      description: "unused files, exports, dependencies, and catalog entries",
      label: "knip",
      phase: "analyze",
    }),
    contribute(toolConventions, {
      text: "Delete what `vp run knip` reports: unused files, exports, dependencies, and catalog entries. Add a Knip config entry only when a plugin cannot see a real reference.",
      title: "Knip",
    }),
  ],
  default: true,
  description: "Finds unused files, exports, dependencies, and catalog entries",
  homepage: "https://knip.dev",
  id: "knip",
  name: "Knip",
});

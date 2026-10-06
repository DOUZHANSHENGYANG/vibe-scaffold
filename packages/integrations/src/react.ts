import type { Context } from "@vibe-scaffold/core";
import {
  contribute,
  defineIntegration,
  file,
  packageJson,
} from "@vibe-scaffold/core";

import { hasBackend } from "#/app.ts";
import { templateContent, templateFiles } from "#/templates.ts";
import { ultracitePresets } from "#/ultracite.ts";
import { agentsConventions } from "#/vite-plus/slots.ts";

const apiStatusPath = "apps/web/src/components/api-status.tsx";

// oRPC brings its own typed status; without it the home page asks `/api/health` directly.
const healthStatus = (ctx: Context) =>
  hasBackend(ctx) && !ctx.has("orpc")
    ? [file(apiStatusPath, templateContent(ctx, "react/health", apiStatusPath))]
    : [];

export const react = defineIntegration({
  contribute: (ctx) => [
    ...templateFiles(ctx, "react/common"),
    ...healthStatus(ctx),
    contribute(packageJson, {
      dependencies: [
        "@tanstack/react-query",
        "@tanstack/react-query-devtools",
        "react",
        "react-dom",
        "zustand",
      ],
      devDependencies: ["@types/react", "@types/react-dom"],
      path: "apps/web",
    }),
    contribute(ultracitePresets, {
      module: "ultracite/oxlint/react",
      name: "react",
    }),
    contribute(agentsConventions, {
      text: "Client state lives in `apps/web/src/stores`: one zustand store per concern, typed where it is created (`create<State>()(...)`), and read with selectors. Server data belongs to TanStack Query, not to a store; a store never caches what a query already caches.",
      title: "Client state",
    }),
  ],
  id: "react",
  kind: "frontend",
  name: "React",
  description: "React 19 with TanStack Query",
  homepage: "https://react.dev",
  provides: ["react"],
  requires: ["frontend-framework", "ui-components"],
});

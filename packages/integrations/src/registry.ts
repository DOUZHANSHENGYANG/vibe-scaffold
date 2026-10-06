import { defineRegistry } from "@vibe-scaffold/core";

import { betterAuth } from "#/better-auth.ts";
import { beui } from "#/beui.ts";
import { bun } from "#/bun.ts";
import { capacitor } from "#/capacitor.ts";
import { catalog } from "#/catalog.ts";
import { docker } from "#/docker.ts";
import { drizzle } from "#/drizzle.ts";
import { electron } from "#/electron.ts";
import { hono } from "#/hono.ts";
import { knip } from "#/knip.ts";
import { localDb } from "#/local-db.ts";
import { node } from "#/node.ts";
import { openapi } from "#/openapi.ts";
import { orpc } from "#/orpc.ts";
import { postgres } from "#/postgres.ts";
import { pwa } from "#/pwa.ts";
import { react } from "#/react.ts";
import { shadcn } from "#/shadcn.ts";
import { spa } from "#/spa.ts";
import { sqlite } from "#/sqlite.ts";
import { tanstackRouter } from "#/tanstack-router.ts";
import { tauri } from "#/tauri.ts";
import { ultracite } from "#/ultracite.ts";
import { vitePlus } from "#/vite-plus/index.ts";
import { vitestPlaywright } from "#/vitest-playwright/index.ts";

export const registry = defineRegistry({
  addons: [beui, knip, localDb, pwa, ultracite],
  capabilities: {
    "frontend-framework": "a frontend framework",
    "hono-server": "a Hono server",
    "http-server": "an HTTP server",
    "node-runtime": "a Node.js-compatible runtime",
    react: "React",
    router: "a router",
    "single-page-app": "a single-page app",
    rpc: "a typed RPC layer",
    "sql-database": "a SQL database",
    "sql-orm": "a SQL ORM",
    "ui-components": "a UI component library",
  },
  catalog,
  integrations: [
    vitePlus,
    react,
    spa,
    tanstackRouter,
    hono,
    orpc,
    openapi,
    postgres,
    sqlite,
    drizzle,
    betterAuth,
    shadcn,
    electron,
    tauri,
    capacitor,
    node,
    bun,
    docker,
    vitestPlaywright,
  ],
  kindGroups: [["framework", "backend"]],
  kinds: [
    { id: "toolchain", name: "Toolchain", optional: false },
    { id: "frontend", name: "Frontend", optional: true },
    { id: "framework", name: "Framework", optional: true },
    { id: "router", name: "Router", optional: true },
    { id: "backend", name: "Backend", optional: true },
    { id: "api", name: "API", optional: true },
    { id: "database", name: "Database", optional: true, default: "sqlite" },
    { id: "orm", name: "ORM", optional: true },
    { id: "auth", name: "Auth", optional: true },
    { id: "ui", name: "UI", optional: true },
    { id: "desktop", name: "Desktop", optional: true, default: null },
    { id: "mobile", name: "Mobile", optional: true, default: null },
    { id: "runtime", name: "Runtime", optional: true, default: "node" },
    { id: "deployment", name: "Deployment", optional: true, default: null },
    { id: "testing", name: "Testing", optional: false },
  ],
});

import { readFileSync } from "node:fs";

import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { defineConfig } from "vite-plus";
import type { Plugin } from "vite-plus";

import { vibeScaffold } from "./plugin/index.ts";
import * as docsConfig from "./source.config.ts";

// Serves the published blueprint JSON Schema at `blueprintSchemaUrl`, from the
// file whose content the blueprint test pins, so editors get completions.
const blueprintSchema = (): Plugin => {
  const source = readFileSync(
    `${import.meta.dirname}/../../packages/integrations/schema.json`,
    "utf-8"
  );
  return {
    name: "serve-blueprint-schema",
    configureServer(server) {
      server.middlewares.use("/schema.json", (_req, res) => {
        res.setHeader("content-type", "application/json");
        res.end(source);
      });
    },
    generateBundle() {
      this.emitFile({ fileName: "schema.json", source, type: "asset" });
    },
  };
};

export default defineConfig({
  // GitHub Pages serves the site under /vibe-scaffold/; `PAGES_BASE` is set by the pages workflow.
  base: process.env.PAGES_BASE ?? "/",
  plugins: [
    blueprintSchema(),
    paraglideVitePlugin({
      emitGitIgnore: false,
      emitPrettierIgnore: false,
      emitReadme: false,
      emitTsDeclarations: true,
      outdir: `${import.meta.dirname}/src/paraglide`,
      // The output is checked in so `vp check` runs without a build, so dev and build must emit the same
      // structure. At this message count, one module per locale costs less than one directory per message.
      outputStructure: "locale-modules",
      project: `${import.meta.dirname}/project.inlang`,
      strategy: ["localStorage", "preferredLanguage", "baseLocale"],
    }),
    vibeScaffold(),
    // Only the index the app imports: the pages and their frontmatter, with bodies loaded on demand.
    mdx(docsConfig, { index: { browser: false, dynamic: false } }),
    tanstackRouter({ autoCodeSplitting: true, target: "react" }),
    react({ compiler: true }),
    tailwindcss(),
  ],
  test: {
    name: "web",
    testTimeout: 180_000,
  },
});

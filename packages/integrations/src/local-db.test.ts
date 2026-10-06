import { describe, expect, it } from "vite-plus/test";
import { z } from "zod";

import { generate, legalStacks } from "@vibe-scaffold/core";

import { registry } from "#/registry.ts";
import { stackLabel } from "#/stack-label.ts";
import { verifiedBlueprint, verifiedName } from "#/verification.ts";

const manifestSchema = z.looseObject({
  dependencies: z.record(z.string(), z.string()),
});
const capabilitiesSchema = z.looseObject({
  permissions: z.array(z.string()),
});

const contentOf = (
  files: readonly { path: string; content: string }[],
  path: string
) => {
  const content = files.find((file) => file.path === path)?.content;
  if (content === undefined) {
    throw new Error(`No ${path} in the generation`);
  }
  return content;
};

const stack = legalStacks(registry).find(
  (candidate) => stackLabel(candidate) === "spa-hono-orpc-sqlite-better-auth"
);
if (stack === undefined) {
  throw new Error("The local-db test stack is not legal");
}

describe("the local-db add-on", () => {
  it("adds only its own files and the idb dependency", async () => {
    const [base, local] = await Promise.all([
      generate(registry, verifiedBlueprint(stack), { name: verifiedName }),
      generate(
        registry,
        { ...verifiedBlueprint(stack), addons: ["local-db"] },
        { name: verifiedName }
      ),
    ]);
    const basePaths = new Set(base.files.map((file) => file.path));
    expect(
      local.files
        .filter((file) => !basePaths.has(file.path))
        .map((file) => file.path)
        .toSorted()
    ).toStrictEqual([
      "apps/web/src/components/local-storage-card.tsx",
      "apps/web/src/lib/db.ts",
    ]);
    const webManifest = manifestSchema.parse(
      JSON.parse(contentOf(local.files, "apps/web/package.json"))
    );
    expect(Object.keys(webManifest.dependencies)).toContain("idb");
    expect(Object.keys(webManifest.dependencies)).not.toContain(
      "@tauri-apps/plugin-sql"
    );
  });

  it("backs the desktop variant with the Tauri SQL plugin", async () => {
    const desktopStack = { ...stack, desktop: "tauri" };
    const local = await generate(
      registry,
      { ...verifiedBlueprint(desktopStack), addons: ["local-db"] },
      { name: verifiedName }
    );
    expect(contentOf(local.files, "src-tauri/Cargo.toml")).toContain(
      'tauri-plugin-sql = { version = "2", features = ["sqlite"] }'
    );
    expect(contentOf(local.files, "src-tauri/src/main.rs")).toContain(
      ".plugin(tauri_plugin_sql::Builder::default().build())"
    );
    const capabilities = capabilitiesSchema.parse(
      JSON.parse(contentOf(local.files, "src-tauri/capabilities/default.json"))
    );
    expect(capabilities.permissions).toContain("sql:default");
    const webManifest = manifestSchema.parse(
      JSON.parse(contentOf(local.files, "apps/web/package.json"))
    );
    expect(Object.keys(webManifest.dependencies)).toContain("idb");
    expect(Object.keys(webManifest.dependencies)).toContain(
      "@tauri-apps/plugin-sql"
    );
  });
});

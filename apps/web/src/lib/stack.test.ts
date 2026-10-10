import { stacks } from "virtual:vibe-scaffold";
import { describe, expect, it } from "vite-plus/test";

import {
  addonsFlag,
  commandLine,
  commandWords,
  entryFromFlags,
  flagsOf,
  integrationOf,
  outcome,
  parseAddons,
  parseFlags,
  recommended,
  searchSchema,
  verificationWith,
  verifiedAddons,
  whyIncluded,
} from "#/lib/stack.ts";

const entry = (label: string) => {
  const found = stacks.find((candidate) => candidate.label === label);
  if (found === undefined) {
    throw new Error(`No stack ${label}`);
  }
  return found;
};

describe("stack flags", () => {
  it("names every legal stack, and the stack it names is the same one", () => {
    for (const { label, stack } of stacks) {
      expect(entryFromFlags(flagsOf(stack)).label).toBe(label);
    }
  }, 120_000);

  it("leaves out the decisions the others imply", () => {
    expect(flagsOf(entry("hono-openapi-sqlite").stack)).toStrictEqual({
      api: "openapi",
      auth: "none",
      database: "sqlite",
      deployment: "none",
      framework: "none",
    });
  });
});

describe("desktop shell", () => {
  it("is chosen with the flag the CLI takes", () => {
    const { stack } = entryFromFlags({ desktop: "electron" });
    expect(stack.desktop).toBe("electron");
    expect(stack.framework).toBe("spa");
    expect(flagsOf(stack).desktop).toBe("electron");
  });
});

describe("flags to a stack", () => {
  it("starts where the CLI's compose starts", () => {
    expect(entryFromFlags({}).label).toBe("spa-hono-orpc-sqlite-better-auth");
  });

  it("recommends the stack the CLI creates without flags", () => {
    expect(recommended).toStrictEqual(entryFromFlags({}).stack);
  });

  it("repairs flags that leave no legal stack", () => {
    const { stack } = entryFromFlags({
      api: "orpc",
      backend: "none",
      framework: "spa",
    });
    expect(stack.backend).toBe("hono");
  });
});

describe("search params", () => {
  it("keeps only offered values of decided kinds", () => {
    expect(
      parseFlags(
        searchSchema.parse({
          database: "mongo",
          deployment: "none",
          framework: "spa",
          orm: "drizzle",
        })
      )
    ).toStrictEqual({ deployment: "none", framework: "spa" });
  });
});

describe("add-ons", () => {
  it("takes the defaults unless the search names others the registry offers", () => {
    expect(parseAddons()).toStrictEqual(verifiedAddons);
    expect(parseAddons("none")).toStrictEqual([]);
    expect(parseAddons("knip")).toStrictEqual(["knip"]);
    expect(parseAddons("eslint")).toStrictEqual(verifiedAddons);
  });

  it("takes Ultracite alone or alongside Knip", () => {
    // An explicit list replaces the defaults entirely, in registry order.
    expect(parseAddons("ultracite")).toStrictEqual(["ultracite"]);
    expect(parseAddons("ultracite,knip")).toStrictEqual(["knip", "ultracite"]);
  });

  it("names them in the search and the command only when they are not the defaults", () => {
    expect(addonsFlag(verifiedAddons)).toBeUndefined();
    expect(addonsFlag([])).toBe("none");
    const { stack } = entry("hono-openapi-sqlite");
    expect(
      commandLine(commandWords(flagsOf(stack), "acme", "pnpm", []))
    ).toMatch(/ --addons none$/u);
  });

  it("stays verified without a default add-on", () => {
    for (const stack of stacks) {
      expect(verificationWith(stack, [])).toBe(stack.verification);
    }
  });
});

describe("choosing an option", () => {
  const start = entry("spa-hono-orpc-sqlite-better-auth").stack;

  it("changes nothing else when the choice alone is legal", () => {
    const only = outcome(start, "database", "postgres");
    expect(only?.changes).toHaveLength(0);
    expect(only?.entry.label).toBe("spa-hono-orpc-postgres-better-auth");
  });

  it("adds the framework without changing the rest", () => {
    const only = outcome(
      entry("hono-openapi-sqlite").stack,
      "framework",
      "spa"
    );
    expect(only?.entry.label).toBe("spa-hono-openapi-sqlite");
    expect(only?.changes).toStrictEqual([]);
  });
});

describe("why an integration is included", () => {
  it("names what needs an integration nobody chose", () => {
    const { stack } = entry("hono-postgres-better-auth");
    expect(whyIncluded(stack, integrationOf("drizzle"))).toBe(
      "PostgreSQL and Better Auth need a SQL ORM."
    );
  });

  it("gives no reason for the foundation, which nothing needs", () => {
    const { stack } = entry("hono-postgres-better-auth");
    expect(whyIncluded(stack, integrationOf("vite-plus"))).toBeUndefined();
  });
});

describe("the create command", () => {
  it("writes the command a person runs", () => {
    const { stack } = entry("spa-hono-orpc-sqlite-better-auth-docker");
    const line = commandLine(commandWords(flagsOf(stack), "acme", "pnpm"));
    expect(line).toMatch(
      /^pnpm dlx @douzhanshengyang\/vibe-scaffold-cli acme .*--framework spa .*--api orpc .*--database sqlite .*--auth better-auth .*--deployment docker$/u
    );
  });
});

describe("Bun selections", () => {
  it("round-trips a Bun Hono runtime and keeps Node as the default", () => {
    const bun = entryFromFlags({ backend: "hono", runtime: "bun" });
    expect(bun.stack.runtime).toBe("bun");
    expect(entryFromFlags(flagsOf(bun.stack)).label).toBe(bun.label);
    expect(entryFromFlags({ backend: "hono" }).stack.runtime).toBe("node");
  });

  it("names the package manager separately from the command runner", () => {
    const flags = flagsOf(entryFromFlags({ backend: "hono" }).stack);
    expect(
      commandLine(commandWords(flags, "acme", "pnpm", verifiedAddons, "bun"))
    ).toContain("--package-manager bun");
    expect(
      commandLine(commandWords(flags, "acme", "bun", verifiedAddons, "pnpm"))
    ).toMatch(/^bunx @douzhanshengyang\/vibe-scaffold-cli/u);
    expect(
      verificationWith(
        { ...entryFromFlags({}), bunVerification: null },
        verifiedAddons,
        "bun"
      )
    ).toBeNull();
  });
});

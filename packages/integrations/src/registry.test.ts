import { describe, expect, it } from "vite-plus/test";

import { registry } from "#/registry.ts";

describe("the registry", () => {
  it("links every third-party integration to its official site over HTTPS", () => {
    // `local-db` is vibe-scaffold's own glue: it has no third-party project to link.
    const linked = [...registry.integrations, ...registry.addons].filter(
      ({ id }) => id !== "local-db" && id !== "app-shell"
    );
    expect(
      linked
        .filter(({ homepage }) => homepage === undefined)
        .map(({ id }) => id)
    ).toStrictEqual([]);
    for (const { homepage } of linked) {
      expect(new URL(homepage ?? "").protocol).toBe("https:");
    }
  });
});

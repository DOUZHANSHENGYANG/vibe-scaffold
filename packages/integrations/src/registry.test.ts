import { describe, expect, it } from "vite-plus/test";

import { registry } from "#/registry.ts";

describe("the registry", () => {
  it("links every third-party integration to its official site over HTTPS", () => {
    const linked = [...registry.integrations, ...registry.addons];
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

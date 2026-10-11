import { describe, expect, it } from "vite-plus/test";

import { stackLabel } from "#/stack-label.ts";
import {
  bunSubjects,
  covers,
  verification,
  verifiedStacks,
} from "#/verification.ts";

describe("verification.json", () => {
  it("records only the stacks the data model keeps", () => {
    const labels = new Set([
      ...verifiedStacks.map(stackLabel),
      ...bunSubjects.map((stack) => `${stackLabel(stack)}-bun-pm`),
    ]);
    expect(
      Object.keys(verification).filter((label) => !labels.has(label))
    ).toStrictEqual([]);
  });

  it("never records a stack outside every Bun subject's coverage", () => {
    // The record job commits what the shards finished, so the matrix fills in
    // across runs. The invariant that always holds: a recorded stack's Bun
    // verification belongs to a subject that covers it.
    const uncovered = verifiedStacks
      .filter((stack) => stackLabel(stack) in verification)
      .filter((stack) => !bunSubjects.some((subject) => covers(subject, stack)))
      .map(stackLabel);
    expect(uncovered).toStrictEqual([]);
  });
});

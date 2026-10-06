import type { Stack } from "@vibe-scaffold/core";

export const stackLabel = (stack: Stack) =>
  [
    stack.framework,
    stack.backend,
    stack.api,
    stack.database,
    stack.auth,
    stack.desktop,
    stack.mobile,
    ...(stack.runtime === "bun" ? ["bun"] : []),
    stack.deployment,
  ]
    .filter((id) => id !== undefined)
    .join("-");

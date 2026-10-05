declare module "virtual:vibe-scaffold" {
  import type { RegistryInfo } from "@vibe-scaffold/core";

  import type { StackEntry } from "#/lib/project.ts";

  /** The project name the previews are generated for. */
  export const previewName: string;
  export const registry: RegistryInfo;
  export const stacks: readonly StackEntry[];
}

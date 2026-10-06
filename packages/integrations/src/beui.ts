import { contribute, defineAddon } from "@vibe-scaffold/core";

import { shadcnRegistries } from "#/shadcn.ts";
import { agentsConventions } from "#/vite-plus/slots.ts";

export const beui = defineAddon({
  contribute: () => [
    contribute(shadcnRegistries, {
      name: "@beui",
      url: "https://beui.dev/r/{path}.json",
    }),
    contribute(agentsConventions, {
      text: `beUI (animated Motion + Tailwind components) is wired as the \`@beui\` shadcn registry. From \`packages/ui\`, install one with \`pnpm dlx shadcn@latest add @beui/<slug>\` — the CLI writes the component under \`packages/ui/src/components\` and adds \`motion\`, \`clsx\`, and \`tailwind-merge\` itself. Browse the catalogue of 100+ components at https://beui.dev/r; \`theme-toggle\` is the pick for a View-Transition light/dark switch, and the \`motion\` category covers buttons, tabs, drawers, modals, and toasts. Components land in the vendored area, so they are formatted but not linted.`,
      title: "beUI",
    }),
  ],
  default: false,
  description:
    "beUI registry wiring: animated Motion components installable through the shadcn CLI",
  homepage: "https://beui.dev",
  id: "beui",
  name: "beUI",
  supportsAdd: true,
});

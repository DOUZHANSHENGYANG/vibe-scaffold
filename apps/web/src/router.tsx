import { createRouter } from "@tanstack/react-router";

import { routeTree } from "#/routeTree.gen.ts";

// GitHub Pages hosts the app under /vibe-scaffold/, which `base` turns into `BASE_URL`.
const basepath = import.meta.env.BASE_URL.replace(/\/+$/u, "");

export const createAppRouter = () =>
  createRouter({
    basepath: basepath === "" ? undefined : basepath,
    defaultPreload: "intent",
    routeTree,
    scrollRestoration: true,
  });

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}

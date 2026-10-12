import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite-plus";

export default defineConfig(({ mode }) => {
  const { SERVER_URL = "http://localhost:3000" } = loadEnv(
    mode,
    import.meta.dirname,
    ""
  );

  return {
    plugins: [
      paraglideVitePlugin({
        project: `${import.meta.dirname}/project.inlang`,
        outdir: `${import.meta.dirname}/src/paraglide`,
        strategy: ["localStorage", "preferredLanguage", "baseLocale"],
        outputStructure: "locale-modules",
        emitTsDeclarations: true,
        emitGitIgnore: false,
      }),
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      react({ compiler: true }),
      tailwindcss(),
    ],
    server: {
      proxy: {
        "/api": SERVER_URL,
        "/rpc": SERVER_URL,
      },
    },
  };
});

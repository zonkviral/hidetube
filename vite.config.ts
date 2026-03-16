import { defineConfig } from "vite";

import { readFileSync } from "fs";

import react from "@vitejs/plugin-react";
import webExtension from "vite-plugin-web-extension";

import path from "path";

const target = process.env.BUILD_TARGET === "firefox" ? "firefox" : "chrome";

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: () =>
        JSON.parse(
          readFileSync(path.resolve(__dirname, `manifests/manifest.${target}.json`), "utf-8"),
        ),
    }),
  ],
  build: {
    outDir: "build",
    sourcemap: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});

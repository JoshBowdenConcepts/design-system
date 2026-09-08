import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    name: "components",
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    conditions: ["import"],
  },
  test: {
    include: ["tests/**/*.test.ts"],
    globals: true,
  },
});

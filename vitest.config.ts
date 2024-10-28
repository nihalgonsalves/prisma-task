import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["./bin/**/*.spec.ts", "./src/**/*.spec.ts"],
	},
});

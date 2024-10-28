import tseslint from "typescript-eslint";

import sharedConfig from "@nihalgonsalves/esconfig/eslint.config.shared.js";

export default tseslint.config(
	{ ignores: ["eslint.config.js", "vitest.config.ts", "build/**/*"] },
	...sharedConfig,
	{
		files: ["bin/**/*"],
		rules: {
			"import/no-extraneous-dependencies": [
				"error",
				{
					devDependencies: true,
				},
			],
		},
	},
);

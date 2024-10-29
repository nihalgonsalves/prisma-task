import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { executeParsedQuery, type Row } from "./executeParsedQuery";
import { parseQuery } from "./parseQuery";
import { readCSV } from "./readCSV";
import { promiseWithResolvers, withAsyncTiming, withTiming } from "./util";

// #region Args
const args = parseArgs({
	options: {
		path: {
			type: "string",
			default: fileURLToPath(new URL("../data/data.csv", import.meta.url)),
		},
		query: {
			type: "string",
		},
	},
	args: process.argv.slice(2),
});

const path = args.values.path;
if (!path) {
	throw new Error("Path is required");
}
// #endregion

// #region: Read CSV
const data: Row[] = [];
try {
	await withAsyncTiming(`Loaded ${path}`, async () =>
		readCSV(path, (row) => {
			data.push(row);
		}),
	);
} catch (e) {
	console.error(
		`Failed to load CSV: ${e instanceof Error ? e.message : "Unknown error"}`,
	);
	process.exit(1);
}
// #endregion

const processQuery = (query: string) => {
	const parsedQuery = parseQuery(query);

	const results = [...executeParsedQuery(data, parsedQuery)];

	console.table(results);
	console.log(`Found ${results.length} matching rows`);
};

if (args.values.query) {
	processQuery(args.values.query);
} else {
	// #region: REPL

	const abortController = new AbortController();
	process.on("SIGINT", () => {
		abortController.abort();
	});

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	while (!abortController.signal.aborted) {
		const { promise, resolve } = promiseWithResolvers();

		rl.question("> ", abortController, (query) => {
			try {
				withTiming(`Executed query '${query}'`, () => {
					processQuery(query);
				});
			} catch (e) {
				console.error(e);
			}

			resolve(undefined);
		});

		// prevent `unsettled top-level await` warning
		abortController.signal.addEventListener("abort", () => {
			resolve(undefined);
		});

		await promise;
	}

	// #endregion
}

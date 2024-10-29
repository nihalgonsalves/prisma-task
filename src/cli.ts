import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { executeParsedQuery, type Row } from "./executeParsedQuery";
import { parseQuery } from "./parseQuery";
import { readCSV } from "./readCSV";

const args = parseArgs({
	options: {
		path: {
			type: "string",
			default: fileURLToPath(new URL("../data/data.csv", import.meta.url)),
		},
	},
	args: process.argv.slice(2),
});

const path = args.values.path;
if (!path) {
	throw new Error("Path is required");
}

const data: Row[] = [];

await readCSV(path, (row) => {
	data.push(row);
});

console.log(`Loaded ${data.length} rows from ${path}`);

const abortController = new AbortController();
process.on("SIGINT", () => {
	abortController.abort();
});

const processQuery = (query: string) => {
	const parsedQuery = parseQuery(query);

	const results = [...executeParsedQuery(data, parsedQuery)];

	console.table(results);
	console.log(`Found ${results.length} matching rows`);
};

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

while (!abortController.signal.aborted) {
	const { promise, resolve } = Promise.withResolvers();

	rl.question("> ", abortController, (query) => {
		try {
			processQuery(query);
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

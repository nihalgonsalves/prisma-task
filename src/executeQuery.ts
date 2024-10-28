import { createReadStream, type PathLike } from "node:fs";

import papa from "papaparse";
import { z } from "zod";

import { getPredicate, project, type Row } from "./executeParsedQuery";
import { parseQuery } from "./parseQuery";

const CSVValueSchema = z.union([z.coerce.number().int(), z.string()]);

const readCSV = async (dataPath: PathLike, onData: (row: Row) => void) => {
	const { promise, resolve, reject } = Promise.withResolvers();
	const readStream = createReadStream(dataPath, "utf8");

	papa.parse<Row>(readStream, {
		header: true,
		transform(value) {
			return CSVValueSchema.parse(value);
		},
		step(results) {
			onData(results.data);
		},
		error(error) {
			reject(error);
		},
		complete() {
			resolve(undefined);
		},
	});

	return promise;
};

export const executeQuery = async (
	query: string,
	dataPath: PathLike,
	onMatch: (data: Row) => void,
) => {
	const parsedQuery = parseQuery(query);
	const predicate = getPredicate(parsedQuery.filter);

	await readCSV(dataPath, (row) => {
		if (predicate(row)) {
			onMatch(project(row, parsedQuery.projections));
		}
	});
};

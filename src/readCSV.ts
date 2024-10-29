import { createReadStream, type PathLike } from "node:fs";

import papa from "papaparse";
import { z } from "zod";

import type { Row } from "./executeParsedQuery";
import { promiseWithResolvers } from "./util";

const CSVValueSchema = z.union([z.coerce.number().int(), z.string()]);

export const readCSV = async (
	dataPath: PathLike,
	onData: (row: Row) => void,
) => {
	const { promise, resolve, reject } = promiseWithResolvers();
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

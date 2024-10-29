import type { PathLike } from "node:fs";

import { getPredicate, project, type Row } from "./executeParsedQuery";
import { parseQuery } from "./parseQuery";
import { readCSV } from "./readCSV";

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

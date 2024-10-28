import type { Query, Filter } from "./parseQuery";

export type Row = Record<string, string | number | null | undefined>;

const getPredicate = (filter: Filter) => {
	switch (filter.operator) {
		case "=":
			return (row: Row) => row[filter.column] === filter.value;

		case ">":
			return (row: Row) => {
				const value = row[filter.column];

				if (value == null || typeof value === "string") {
					return false;
				}

				return value > filter.value;
			};

		default:
			throw new Error("Invalid operator");
	}
};

export const executeParsedQuery = function* (
	data: Iterable<Row>,
	query: Query,
): IterableIterator<Partial<Row>> {
	const predicate = getPredicate(query.filter);

	for (const row of data) {
		if (predicate(row)) {
			yield Object.fromEntries(
				query.projections.map((p) => [p, row[p] ?? null]),
			);
		}
	}
};

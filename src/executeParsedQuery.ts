import type { Query, Filter } from "./parseQuery";

export type Row = Record<string, string | number | null | undefined>;

const NUMERIC_OPERATOR = {
	">": (a: number, b: number) => a > b,
	"<": (a: number, b: number) => a < b,
	">=": (a: number, b: number) => a >= b,
	"<=": (a: number, b: number) => a <= b,
};

export const getPredicate = (filter: Filter) => {
	switch (filter.operator) {
		case "=":
			return (row: Row) => row[filter.column] === filter.value;

		case ">":
		case "<":
		case ">=":
		case "<=":
			return (row: Row) => {
				const value = row[filter.column];

				if (value == null || typeof value === "string") {
					return false;
				}

				return NUMERIC_OPERATOR[filter.operator](value, filter.value);
			};

		default:
			throw new Error("Invalid operator");
	}
};

export const project = (row: Row, projections: string[]) =>
	Object.fromEntries(projections.map((p) => [p, row[p] ?? null]));

export const executeParsedQuery = function* (
	data: Iterable<Row>,
	query: Query,
): IterableIterator<Partial<Row>> {
	const predicate = getPredicate(query.filter);

	for (const row of data) {
		if (predicate(row)) {
			yield project(row, query.projections);
		}
	}
};

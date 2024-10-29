import { z } from "zod";

const OperatorNumericSchema = z.enum([">", "<", ">=", "<="]);
type OperatorNumeric = z.infer<typeof OperatorNumericSchema>;

type OperatorEqual = "=";

export type Filter = { column: string } & (
	| {
			operator: OperatorNumeric;
			value: number;
	  }
	| {
			operator: OperatorEqual;
			value: number | string;
	  }
);

export type Query = {
	projections: string[];
	filter: Filter;
};

export class ParserError extends Error {}

// Since the syntax is a single line, use a simple regex instead of a full
// parser. The downsides are that error messages are more vague and the grammar
// is much less extensible. I chose this tradeoff as this would still support
// adding multiple filters, but not much else.

// A middleground for error reporting could be to loosen the matchers in the
// regex, keeping only the structure, and validating in the ZodSchema, giving
// more granular errors
const QueryRegEx =
	/^PROJECT\s+(?<projections>[A-Za-z0-9\s,]*)\s+FILTER\s+(?<filterColumn>[A-Za-z0-9]*)\s*(?<filterOperand>[><=]{1,2})\s*(?<filterValue>[0-9]+|"\w*");?$/i;

const CommaSeparatedProjections = z
	.string()
	.transform((v) => v.split(",").map((p) => p.trim()));

const QueryMatchGroupSchema = z.discriminatedUnion("filterOperand", [
	z.object({
		projections: CommaSeparatedProjections,
		filterColumn: z.string(),
		filterOperand: OperatorNumericSchema,
		filterValue: z.coerce.number().int(),
	}),
	z.object({
		projections: CommaSeparatedProjections,
		filterColumn: z.string(),
		filterOperand: z.literal("="),
		filterValue: z.union([
			z.coerce.number().int(),
			z
				.string()
				.regex(/"\w*"/)
				.transform((v) => v.slice(1, -1)),
		]),
	}),
]);

/**
 * A narrowly-defined syntax:
 * - single line
 * - projections are comma-separated
 * - columns are alphanumeric
 * - only one filter is allowed - LHS is the column, RHS is a value
 * - values are either number literals or strings enclosed in double quotes
 *
 * e.g.: PROJECT col1, col2 FILTER col3 > "value"
 */
export const parseQuery = (query: string): Query => {
	const match = QueryRegEx.exec(query);
	if (!match?.groups) {
		throw new ParserError("Invalid query");
	}

	const parsedGroups = QueryMatchGroupSchema.safeParse(match.groups);
	if (!parsedGroups.success) {
		throw new ParserError(parsedGroups.error.message);
	}

	// required to satisfy TypeScript's discriminated union check

	switch (parsedGroups.data.filterOperand) {
		case "=":
			return {
				projections: parsedGroups.data.projections,
				filter: {
					column: parsedGroups.data.filterColumn,
					operator: parsedGroups.data.filterOperand,
					value: parsedGroups.data.filterValue,
				},
			};

		default:
			return {
				projections: parsedGroups.data.projections,
				filter: {
					column: parsedGroups.data.filterColumn,
					operator: parsedGroups.data.filterOperand,
					value: parsedGroups.data.filterValue,
				},
			};
	}
};

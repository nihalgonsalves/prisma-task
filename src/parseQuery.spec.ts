import { describe, expect, it } from "vitest";

import { parseQuery, ParserError } from "./parseQuery";

describe("parseQuery", () => {
	it("parses a query with a single projection and a numeric > filter", () => {
		const query = "PROJECT col1 FILTER col1 > 1";

		expect(parseQuery(query)).toEqual({
			projections: ["col1"],
			filter: {
				column: "col1",
				operator: ">",
				value: 1,
			},
		});
	});

	it("parses a query with a multiple projections and a numeric > filter", () => {
		const query = "PROJECT col1, col2 FILTER col1 > 1";

		expect(parseQuery(query)).toEqual({
			projections: ["col1", "col2"],
			filter: {
				column: "col1",
				operator: ">",
				value: 1,
			},
		});
	});

	it("parses a query with a multiple projections and a numeric = filter", () => {
		const query = "PROJECT col1, col2 FILTER col1 = 1";

		expect(parseQuery(query)).toEqual({
			projections: ["col1", "col2"],
			filter: {
				column: "col1",
				operator: "=",
				value: 1,
			},
		});
	});

	it("parses a query with a multiple projections and a string = filter", () => {
		const query = 'PROJECT col1, col2 FILTER col1 = "hello"';

		expect(parseQuery(query)).toEqual({
			projections: ["col1", "col2"],
			filter: {
				column: "col1",
				operator: "=",
				value: "hello",
			},
		});
	});

	it("parses a query with no spacing within projections and the filter", () => {
		const query = 'PROJECT col1,col2 FILTER col1="hello"';

		expect(parseQuery(query)).toEqual({
			projections: ["col1", "col2"],
			filter: {
				column: "col1",
				operator: "=",
				value: "hello",
			},
		});
	});

	it("parses a query with differently cased keywords", () => {
		const query = 'PROject col1, col2 filtER col1 = "hello"';

		expect(parseQuery(query)).toEqual({
			projections: ["col1", "col2"],
			filter: {
				column: "col1",
				operator: "=",
				value: "hello",
			},
		});
	});

	it("parses a query with an ending semicolon", () => {
		const query = "PROJECT col1, col2 FILTER col1 > 1;";

		expect(parseQuery(query)).toEqual({
			projections: ["col1", "col2"],
			filter: {
				column: "col1",
				operator: ">",
				value: 1,
			},
		});
	});

	it("throws a ParserError if the query is incomplete", () => {
		const query = "PROJECT col1,col2 FILTER";

		expect(() => parseQuery(query)).toThrowError(ParserError);
	});

	it("throws a ParserError if there's a > operand with a string value", () => {
		const query = 'PROJECT col1, col2 FILTER col1 > "hello"';

		expect(() => parseQuery(query)).toThrowError(ParserError);
	});

	it("throws a ParserError if the column names are not alphanumeric literals", () => {
		const query = 'PROJECT col$1, col2 FILTER col1 = "hello"';

		expect(() => parseQuery(query)).toThrowError(ParserError);
	});
});

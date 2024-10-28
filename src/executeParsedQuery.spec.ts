import { describe, expect, it } from "vitest";

import { executeParsedQuery } from "./executeParsedQuery";

const data = [
	{ id: 1, name: "Alice", city: "Berlin", age: 25 },
	{ id: 2, name: "Bob", city: "New York", age: 30 },
	{ id: 3, name: "Charlie", city: "Tokyo", age: 35 },
];

describe("executeQuery", () => {
	it("filters by string equality", () => {
		expect([
			...executeParsedQuery(data, {
				projections: ["name"],
				filter: { column: "city", operator: "=", value: "Berlin" },
			}),
		]).toEqual([{ name: "Alice" }]);
	});

	it("filters by number equality", () => {
		expect([
			...executeParsedQuery(data, {
				projections: ["name"],
				filter: { column: "age", operator: "=", value: 25 },
			}),
		]).toEqual([{ name: "Alice" }]);
	});

	it("filters by greater than", () => {
		expect([
			...executeParsedQuery(data, {
				projections: ["name"],
				filter: { column: "age", operator: ">", value: 25 },
			}),
		]).toEqual([{ name: "Bob" }, { name: "Charlie" }]);
	});

	// TODO: throw error instead? would have to pass in the column names
	// separately from the data
	it("returns null for invalid projections", () => {
		expect([
			...executeParsedQuery(data, {
				projections: ["name", "xxx"],
				filter: { column: "name", operator: "=", value: "Alice" },
			}),
		]).toEqual([{ name: "Alice", xxx: null }]);
	});
});

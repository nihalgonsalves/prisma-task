import { faker } from "@faker-js/faker";
import papa from "papaparse";

import { range, getFileWriteStream } from "../src/util";

const COL_COUNT = 10;
const ROW_COUNT = 10_000;
const OUTPUT_FILE = new URL("../data/data.csv", import.meta.url);

type ColumnType = "string" | "integer";

// Generate columns and pre-specify each type
const columns = Array.from({ length: COL_COUNT }, (_, i) => ({
	name: `col${i + 1}`,
	type: faker.helpers.arrayElement<ColumnType>(["string", "integer"]),
}));

using output = getFileWriteStream(OUTPUT_FILE, {
	encoding: "utf8",
	flags: "w",
});

// Write headers
output.writeLn(papa.unparse([columns.map(({ name }) => name)]));

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
for (const _ of range(ROW_COUNT)) {
	output.writeLn(
		papa.unparse([
			columns.map(({ type }) =>
				type === "string"
					? faker.word.noun()
					: faker.number.int({ min: 0, max: 10_000 }).toFixed(0),
			),
		]),
	);
}

console.log("Done");

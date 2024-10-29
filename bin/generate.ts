import { faker } from "@faker-js/faker";
import papa from "papaparse";

import { range, getFileWriteStream } from "../src/util";

const ROW_COUNT = 10_000;
const OUTPUT_FILE = new URL("../data/data.csv", import.meta.url);

let id = 0;

// Generate columns and pre-specify each type
const columns = [
	{
		name: "id",
		generate: () => id++,
	},
	{
		name: "name",
		generate: () => faker.person.firstName(),
	},
	{
		name: "email",
		generate: () => faker.internet.email(),
	},
	{
		name: "age",
		generate: () => faker.number.int({ min: 0, max: 100 }),
	},
	{
		name: "city",
		generate: () => faker.location.city(),
	},
	{
		name: "favourite_fruit",
		generate: () => faker.food.fruit(),
	},
];

using output = getFileWriteStream(OUTPUT_FILE, {
	encoding: "utf8",
	flags: "w",
});

// Write headers
output.writeLn(papa.unparse([columns.map(({ name }) => name)]));

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
for (const _ of range(ROW_COUNT)) {
	output.writeLn(papa.unparse([columns.map(({ generate }) => generate())]));
}

console.log("Done");

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import Papa from "papaparse";
import { describe, expect, it } from "vitest";

import type { Row } from "./executeParsedQuery";
import { executeQuery } from "./executeQuery";

const setup = async (data: Row[]) => {
	const dir = await mkdtemp(join(tmpdir(), "test-"));
	const file = join(dir, "data.csv");

	await writeFile(file, Papa.unparse(data), "utf-8");

	return {
		file,
		[Symbol.dispose]: async () => {
			await rm(dir, { recursive: true, force: true });
		},
	};
};

describe("executeQuery", () => {
	it("returns filtered rows", async () => {
		using data = await setup([
			{ col1: "1", col2: "2" },
			{ col1: "200", col2: "2" },
		]);

		const results: Row[] = [];

		await executeQuery("PROJECT col1 FILTER col1 > 100", data.file, (row) =>
			results.push(row),
		);

		expect(results).toEqual([{ col1: 200 }]);
	});
});

import { describe, expect, it } from "vitest";

import { range } from "./util";

describe("range", () => {
	it("returns N values", () => {
		expect([...range(5)]).toEqual([0, 1, 2, 3, 4]);
	});
});

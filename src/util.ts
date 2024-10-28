import { createWriteStream } from "node:fs";

export const range = function* (n: number) {
	for (let i = 0; i < n; i++) {
		yield i;
	}
};

/**
 * augments createWriteStream with Symbol.dispose so that the stream is closed
 * automatically when using `using`
 */
export const getFileWriteStream = (
	...args: Parameters<typeof createWriteStream>
) => {
	const writeStream = createWriteStream(...args);

	return {
		writeStream,
		writeLn: (line: string) => writeStream.write(`${line}\n`),
		[Symbol.dispose]: () => {
			writeStream.close();
		},
	};
};

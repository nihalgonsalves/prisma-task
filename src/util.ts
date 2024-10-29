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

// Note: Not needed in Node 22 (enters LTS on 29.10.2024), but copied here as
// the task mentioned Node 20 support

export const promiseWithResolvers = <T>() => {
	let resolve: (value: T) => void;
	let reject: (error: Error) => void;

	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return {
		promise,
		// @ts-expect-error use before defined
		resolve,
		// @ts-expect-error use before defined
		reject,
	};
};

export const withTiming = (label: string, fn: () => void) => {
	console.time(label);
	fn();
	console.timeEnd(label);
};

export const withAsyncTiming = async (
	label: string,
	fn: () => Promise<unknown>,
) => {
	console.time(label);
	await fn();
	console.timeEnd(label);
};

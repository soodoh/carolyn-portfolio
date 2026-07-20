import type { Stats } from "node:fs";
import {
	type FileHandle,
	open,
	readFile,
	rename,
	rm,
	stat,
	writeFile,
} from "node:fs/promises";

export type FixtureOutputPaths = {
	assetDirectory: string | URL;
	backupAssetDirectory: string | URL;
	backupOutputPath: string | URL;
	commitMarkerPath: string | URL;
	outputPath: string | URL;
	stagedAssetDirectory: string | URL;
	stagedOutputPath: string | URL;
};

const fixtureLockTimeoutMs = 30 * 60 * 1000;
const fixtureLockRetryMs = 100;
export const fixtureLockInitializationGraceMs = 250;

function hasErrorCode(
	error: unknown,
	code: string,
): error is Error & { code: string } {
	return (
		error instanceof Error &&
		"code" in error &&
		typeof error.code === "string" &&
		error.code === code
	);
}

async function pathExists(path: string | URL): Promise<boolean> {
	try {
		await stat(path);
		return true;
	} catch (error) {
		if (hasErrorCode(error, "ENOENT")) {
			return false;
		}
		throw error;
	}
}

function sameFileIdentity(first: Stats, second: Stats): boolean {
	return first.dev === second.dev && first.ino === second.ino;
}

export async function removeStaleFixtureLock(
	lockPath: string | URL,
	beforeRemove?: () => Promise<void>,
): Promise<void> {
	let initialContents: string;
	let initialStat: Stats;
	try {
		[initialContents, initialStat] = await Promise.all([
			readFile(lockPath, "utf8"),
			stat(lockPath),
		]);
	} catch (error) {
		if (hasErrorCode(error, "ENOENT")) {
			return;
		}
		throw error;
	}

	const trimmedContents = initialContents.trim();
	const hasIntegerPid = /^\d+$/.test(trimmedContents);
	const ownerPid = hasIntegerPid ? Number(trimmedContents) : undefined;
	let shouldRemove = ownerPid === undefined || ownerPid <= 0;
	if (
		shouldRemove &&
		Date.now() - initialStat.mtimeMs < fixtureLockInitializationGraceMs
	) {
		return;
	}
	if (!shouldRemove && ownerPid !== undefined) {
		try {
			process.kill(ownerPid, 0);
			return;
		} catch (error) {
			shouldRemove = hasErrorCode(error, "ESRCH");
		}
	}
	if (!shouldRemove) {
		return;
	}

	await beforeRemove?.();
	let currentContents: string;
	let currentStat: Stats;
	try {
		[currentContents, currentStat] = await Promise.all([
			readFile(lockPath, "utf8"),
			stat(lockPath),
		]);
	} catch (error) {
		if (hasErrorCode(error, "ENOENT")) {
			return;
		}
		throw error;
	}
	if (
		currentContents !== initialContents ||
		!sameFileIdentity(initialStat, currentStat)
	) {
		return;
	}
	await rm(lockPath, { force: true });
}

export async function withFixtureOutputLock<T>(
	lockPath: string | URL,
	action: () => Promise<T>,
): Promise<T> {
	const deadline = Date.now() + fixtureLockTimeoutMs;
	while (true) {
		let lock: FileHandle;
		try {
			lock = await open(lockPath, "wx");
		} catch (error) {
			if (!hasErrorCode(error, "EEXIST")) {
				throw error;
			}
			await removeStaleFixtureLock(lockPath);
			if (Date.now() >= deadline) {
				throw new Error("Timed out waiting for the fixture output lock.");
			}
			await Bun.sleep(fixtureLockRetryMs);
			continue;
		}

		try {
			await lock.writeFile(String(process.pid));
			return await action();
		} finally {
			await lock.close();
			await rm(lockPath, { force: true });
		}
	}
}

export async function recoverFixtureOutputs({
	assetDirectory,
	backupAssetDirectory,
	backupOutputPath,
	commitMarkerPath,
	outputPath,
}: FixtureOutputPaths): Promise<void> {
	if (await pathExists(commitMarkerPath)) {
		await Promise.all([
			rm(backupAssetDirectory, { force: true, recursive: true }),
			rm(backupOutputPath, { force: true }),
		]);
		await rm(commitMarkerPath, { force: true });
		return;
	}
	if (await pathExists(backupAssetDirectory)) {
		await rm(assetDirectory, { force: true, recursive: true });
		await rename(backupAssetDirectory, assetDirectory);
	}
	if (await pathExists(backupOutputPath)) {
		await rm(outputPath, { force: true });
		await rename(backupOutputPath, outputPath);
	}
}

export async function replaceFixtureOutputs(
	paths: FixtureOutputPaths,
): Promise<void> {
	await recoverFixtureOutputs(paths);
	try {
		await rename(paths.assetDirectory, paths.backupAssetDirectory);
		await rename(paths.outputPath, paths.backupOutputPath);
		await rename(paths.stagedAssetDirectory, paths.assetDirectory);
		await rename(paths.stagedOutputPath, paths.outputPath);
		await writeFile(paths.commitMarkerPath, "");
		await Promise.all([
			rm(paths.backupAssetDirectory, { force: true, recursive: true }),
			rm(paths.backupOutputPath, { force: true }),
		]);
		await rm(paths.commitMarkerPath, { force: true });
	} catch (error) {
		await recoverFixtureOutputs(paths);
		throw error;
	}
}

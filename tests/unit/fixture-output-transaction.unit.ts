import { afterEach, describe, expect, test } from "bun:test";
import {
	mkdir,
	mkdtemp,
	readFile,
	rename,
	rm,
	stat,
	utimes,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	type FixtureOutputPaths,
	fixtureLockInitializationGraceMs,
	recoverFixtureOutputs,
	removeStaleFixtureLock,
	replaceFixtureOutputs,
	withFixtureOutputLock,
} from "@/scripts/fixture-output-transaction";

const temporaryDirectories: string[] = [];

afterEach(async () => {
	await Promise.all(
		temporaryDirectories
			.splice(0)
			.map((directory) => rm(directory, { force: true, recursive: true })),
	);
});

async function createFixtureOutputs(): Promise<FixtureOutputPaths> {
	const root = await mkdtemp(join(tmpdir(), "fixture-transaction-"));
	temporaryDirectories.push(root);
	const paths = {
		assetDirectory: join(root, "assets"),
		backupAssetDirectory: join(root, "assets.backup"),
		backupOutputPath: join(root, "fixture.json.backup"),
		commitMarkerPath: join(root, "fixture.commit"),
		outputPath: join(root, "fixture.json"),
		stagedAssetDirectory: join(root, "assets.staged"),
		stagedOutputPath: join(root, "fixture.json.staged"),
	};
	await Promise.all([
		mkdir(paths.assetDirectory),
		mkdir(paths.stagedAssetDirectory),
	]);
	await Promise.all([
		writeFile(join(paths.assetDirectory, "asset.txt"), "old-assets"),
		writeFile(join(paths.stagedAssetDirectory, "asset.txt"), "new-assets"),
		writeFile(paths.outputPath, "old-json"),
		writeFile(paths.stagedOutputPath, "new-json"),
	]);
	return paths;
}

async function expectOldOutputs(paths: FixtureOutputPaths): Promise<void> {
	expect(
		await readFile(join(paths.assetDirectory.toString(), "asset.txt"), "utf8"),
	).toBe("old-assets");
	expect(await readFile(paths.outputPath, "utf8")).toBe("old-json");
}

describe("fixture output transaction", () => {
	test("atomically installs matching fixture JSON and assets", async () => {
		const paths = await createFixtureOutputs();
		await replaceFixtureOutputs(paths);
		expect(
			await readFile(
				join(paths.assetDirectory.toString(), "asset.txt"),
				"utf8",
			),
		).toBe("new-assets");
		expect(await readFile(paths.outputPath, "utf8")).toBe("new-json");
	});

	test("finishes cleanup after a committed swap is interrupted", async () => {
		const paths = await createFixtureOutputs();
		await rename(paths.assetDirectory, paths.backupAssetDirectory);
		await rename(paths.outputPath, paths.backupOutputPath);
		await rename(paths.stagedAssetDirectory, paths.assetDirectory);
		await rename(paths.stagedOutputPath, paths.outputPath);
		await writeFile(paths.commitMarkerPath, "");
		await rm(paths.backupAssetDirectory, { recursive: true });

		await recoverFixtureOutputs(paths);
		expect(
			await readFile(
				join(paths.assetDirectory.toString(), "asset.txt"),
				"utf8",
			),
		).toBe("new-assets");
		expect(await readFile(paths.outputPath, "utf8")).toBe("new-json");
	});

	const boundaries: Array<
		"asset backup" | "JSON backup" | "asset install" | "JSON install"
	> = ["asset backup", "JSON backup", "asset install", "JSON install"];
	for (const boundary of boundaries) {
		test(`recovers matching outputs after interruption at the ${boundary} boundary`, async () => {
			const paths = await createFixtureOutputs();
			await rename(paths.assetDirectory, paths.backupAssetDirectory);
			if (boundary !== "asset backup") {
				await rename(paths.outputPath, paths.backupOutputPath);
			}
			if (boundary === "asset install" || boundary === "JSON install") {
				await rename(paths.stagedAssetDirectory, paths.assetDirectory);
			}
			if (boundary === "JSON install") {
				await rename(paths.stagedOutputPath, paths.outputPath);
			}

			await recoverFixtureOutputs(paths);
			await expectOldOutputs(paths);
		});
	}

	test("recovers orphaned malformed and invalid lock contents after initialization", async () => {
		const paths = await createFixtureOutputs();
		const lockPath = join(paths.outputPath.toString(), "..", "fixture.lock");
		const oldTimestamp = new Date(
			Date.now() - fixtureLockInitializationGraceMs - 1_000,
		);
		for (const contents of ["", "not-a-pid", "1.5", "0", "-1"]) {
			await writeFile(lockPath, contents);
			await utimes(lockPath, oldTimestamp, oldTimestamp);
			await removeStaleFixtureLock(lockPath);
			await expect(stat(lockPath)).rejects.toThrow();
		}
	});

	test("preserves a live-owner lock", async () => {
		const paths = await createFixtureOutputs();
		const lockPath = join(paths.outputPath.toString(), "..", "fixture.lock");
		await writeFile(lockPath, String(process.pid));
		await removeStaleFixtureLock(lockPath);
		expect(await readFile(lockPath, "utf8")).toBe(String(process.pid));
	});

	test("recovers a dead-owner lock", async () => {
		const paths = await createFixtureOutputs();
		const lockPath = join(paths.outputPath.toString(), "..", "fixture.lock");
		const exitedOwner = Bun.spawn(["bun", "-e", ""], {
			stderr: "ignore",
			stdout: "ignore",
		});
		await exitedOwner.exited;
		await writeFile(lockPath, String(exitedOwner.pid));
		await removeStaleFixtureLock(lockPath);
		await expect(stat(lockPath)).rejects.toThrow();
	});

	test("preserves a newly-created empty lock during PID initialization", async () => {
		const paths = await createFixtureOutputs();
		const lockPath = join(paths.outputPath.toString(), "..", "fixture.lock");
		await writeFile(lockPath, "");
		await removeStaleFixtureLock(lockPath);
		expect(await readFile(lockPath, "utf8")).toBe("");
	});

	test("does not remove a lock replaced during stale-owner recovery", async () => {
		const paths = await createFixtureOutputs();
		const lockPath = join(paths.outputPath.toString(), "..", "fixture.lock");
		const exitedOwner = Bun.spawn(["bun", "-e", ""], {
			stderr: "ignore",
			stdout: "ignore",
		});
		await exitedOwner.exited;
		await writeFile(lockPath, String(exitedOwner.pid));
		await removeStaleFixtureLock(lockPath, async () => {
			await rm(lockPath);
			await writeFile(lockPath, String(process.pid));
		});
		expect(await readFile(lockPath, "utf8")).toBe(String(process.pid));
	});

	test("serializes concurrent captures so fixture JSON and assets stay matched", async () => {
		const paths = await createFixtureOutputs();
		const lockPath = join(paths.outputPath.toString(), "..", "fixture.lock");
		let activeCaptures = 0;
		let maximumActiveCaptures = 0;

		const capture = (label: string) =>
			withFixtureOutputLock(lockPath, async () => {
				activeCaptures += 1;
				maximumActiveCaptures = Math.max(maximumActiveCaptures, activeCaptures);
				try {
					await Promise.all([
						rm(paths.stagedAssetDirectory, { force: true, recursive: true }),
						rm(paths.stagedOutputPath, { force: true }),
					]);
					await mkdir(paths.stagedAssetDirectory);
					await Promise.all([
						writeFile(
							join(paths.stagedAssetDirectory.toString(), "asset.txt"),
							label,
						),
						writeFile(paths.stagedOutputPath, label),
					]);
					await Bun.sleep(25);
					await replaceFixtureOutputs(paths);
				} finally {
					activeCaptures -= 1;
				}
			});

		await Promise.all([capture("first"), capture("second")]);
		const [asset, output] = await Promise.all([
			readFile(join(paths.assetDirectory.toString(), "asset.txt"), "utf8"),
			readFile(paths.outputPath, "utf8"),
		]);
		expect(maximumActiveCaptures).toBe(1);
		expect(asset).toBe(output);
		expect(["first", "second"]).toContain(output);
	});
});

import { afterEach, describe, expect, test } from "bun:test";
import {
	mkdir,
	mkdtemp,
	readFile,
	rm,
	stat,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	getCleanUrlRules,
	getStaticFilePath,
	getStaticPublicPaths,
	matchesAmplifyRoute,
	prepareAmplifyArtifact,
	readAmplifyArtifactMode,
} from "@/lib/amplify-artifact";

const temporaryDirectories: string[] = [];

afterEach(async () => {
	await Promise.all(
		temporaryDirectories
			.splice(0)
			.map((directory) => rm(directory, { force: true, recursive: true })),
	);
});

async function createArtifact(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), "amplify-artifact-"));
	temporaryDirectories.push(root);
	await mkdir(join(root, "static", "test-assets"), { recursive: true });
	await writeFile(join(root, "static", "test-assets", "image.jpg"), "image");
	await writeFile(
		join(root, "deploy-manifest.json"),
		JSON.stringify({
			version: 1,
			routes: [
				{
					path: "/*.*",
					target: { kind: "Static", cacheControl: "public" },
					fallback: {
						kind: "Compute",
						src: "default",
						compatibilityMetadata: "preserve-fallback",
					},
					compatibilityMetadata: "preserve-route",
				},
				{ path: "/*", target: { kind: "Compute", src: "default" } },
			],
			computeResources: [],
			framework: { name: "nitro", version: "1.0.0" },
			compatibilityMetadata: { preserve: true },
		}),
	);
	return root;
}

describe("Amplify artifact preparation", () => {
	test("keeps fixture assets and adds only known public static routes", async () => {
		const root = await createArtifact();
		await prepareAmplifyArtifact(root, "fixture");
		await expect(
			stat(join(root, "static", "test-assets")),
		).resolves.toBeDefined();
		expect(await readAmplifyArtifactMode(root)).toBe("fixture");
		const deployManifest: unknown = JSON.parse(
			await readFile(join(root, "deploy-manifest.json"), "utf8"),
		);
		expect(deployManifest).toMatchObject({
			compatibilityMetadata: { preserve: true },
			routes: [
				...getStaticPublicPaths().map((path) => ({
					path: getStaticFilePath(path),
					target: { kind: "Static" },
				})),
				{
					path: "/*.*",
					target: { kind: "Static", cacheControl: "public" },
					fallback: { compatibilityMetadata: "preserve-fallback" },
					compatibilityMetadata: "preserve-route",
				},
				{ path: "/*", target: { kind: "Compute", src: "default" } },
			],
		});
	});

	test("defines persistent canonical rules without project authorization state", () => {
		const rules = getCleanUrlRules();
		expect(rules).toContainEqual({
			source: "/",
			status: "200",
			target: "/index.html",
		});
		expect(rules).toContainEqual({
			source: "/about",
			status: "200",
			target: "/about/index.html",
		});
		expect(rules).toContainEqual({
			source: "/about/",
			status: "301",
			target: "/about",
		});
		expect(rules.some((rule) => /^\/projects\/.+/.test(rule.source))).toBe(
			false,
		);
	});

	test("keeps every project detail compute-backed", () => {
		expect(getStaticPublicPaths()).toEqual([
			"/",
			"/about",
			"/photography",
			"/projects",
		]);
		expect(
			getStaticPublicPaths().some((path) => path.startsWith("/projects/")),
		).toBe(false);
	});

	test("matches emitted manifest route patterns in traversal order", () => {
		expect(matchesAmplifyRoute("/about/index.html", "/about/index.html")).toBe(
			true,
		);
		expect(matchesAmplifyRoute("/favicon.png", "/*.*")).toBe(true);
		expect(matchesAmplifyRoute("/missing", "/*.*")).toBe(false);
		expect(matchesAmplifyRoute("/missing", "/*")).toBe(true);
	});

	test("removes fixture assets in production mode", async () => {
		const root = await createArtifact();
		await prepareAmplifyArtifact(root, "production");
		await expect(
			stat(join(root, "static", "test-assets")),
		).rejects.toMatchObject({ code: "ENOENT" });
		expect(await readAmplifyArtifactMode(root)).toBe("production");
	});

	test("rejects an invalid artifact mode marker", async () => {
		const root = await createArtifact();
		await writeFile(join(root, ".artifact-mode"), "stale\n");
		await expect(readAmplifyArtifactMode(root)).rejects.toThrow(
			"invalid mode marker",
		);
	});
});

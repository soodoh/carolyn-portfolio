import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type AmplifyArtifactMode = "fixture" | "production";

export type AmplifyCustomRule = {
	source: string;
	status: "200" | "301";
	target: string;
};

const artifactModeMarker = ".artifact-mode";
const persistentStaticPublicPaths = [
	"/",
	"/about",
	"/photography",
	"/projects",
] as const;

export type AmplifyRouteTarget = Record<string, unknown> & {
	kind: string;
};

export type AmplifyRoute = Record<string, unknown> & {
	fallback?: AmplifyRouteTarget;
	path: string;
	target: AmplifyRouteTarget;
};

export type AmplifyDeployManifest = Record<string, unknown> & {
	version: 1;
	routes: AmplifyRoute[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRoute(value: unknown): value is AmplifyRoute {
	return (
		isRecord(value) &&
		typeof value.path === "string" &&
		isRecord(value.target) &&
		typeof value.target.kind === "string"
	);
}

function isDeployManifest(value: unknown): value is AmplifyDeployManifest {
	return (
		isRecord(value) &&
		value.version === 1 &&
		Array.isArray(value.routes) &&
		value.routes.every(isRoute)
	);
}

function parseDeployManifest(value: unknown): AmplifyDeployManifest {
	if (!isDeployManifest(value)) {
		throw new Error("Amplify generated an invalid deployment manifest.");
	}
	return value;
}

export async function readAmplifyDeployManifest(
	amplifyRoot: string,
): Promise<AmplifyDeployManifest> {
	return parseDeployManifest(
		JSON.parse(
			await readFile(join(amplifyRoot, "deploy-manifest.json"), "utf8"),
		),
	);
}

export async function readAmplifyArtifactMode(
	amplifyRoot: string,
): Promise<AmplifyArtifactMode> {
	const mode = (
		await readFile(join(amplifyRoot, artifactModeMarker), "utf8")
	).trim();
	if (mode !== "fixture" && mode !== "production") {
		throw new Error(`Amplify artifact has an invalid mode marker: ${mode}`);
	}
	return mode;
}

export function getStaticPublicPaths(): string[] {
	return [...persistentStaticPublicPaths];
}

export function getStaticFilePath(publicPath: string): string {
	return publicPath === "/" ? "/index.html" : `${publicPath}/index.html`;
}

export function getCleanUrlRules(): AmplifyCustomRule[] {
	const rules: AmplifyCustomRule[] = [];
	for (const publicPath of persistentStaticPublicPaths) {
		if (publicPath !== "/") {
			rules.push({
				source: `${publicPath}/`,
				status: "301",
				target: publicPath,
			});
		}
		rules.push({
			source: publicPath,
			status: "200",
			target: getStaticFilePath(publicPath),
		});
	}
	return rules;
}

export function matchesAmplifyRoute(
	pathname: string,
	pattern: string,
): boolean {
	const parts = pattern.split("*");
	const first = parts[0];
	if (parts.length === 1) {
		return pathname === pattern;
	}
	if (first === undefined || !pathname.startsWith(first)) {
		return false;
	}

	let cursor = first.length;
	for (const part of parts.slice(1, -1)) {
		const next = pathname.indexOf(part, cursor);
		if (next === -1) {
			return false;
		}
		cursor = next + part.length;
	}
	const last = parts.at(-1);
	return last !== undefined && pathname.slice(cursor).endsWith(last);
}

export async function prepareAmplifyArtifact(
	amplifyRoot: string,
	mode: AmplifyArtifactMode,
): Promise<void> {
	const manifestPath = join(amplifyRoot, "deploy-manifest.json");
	const generatedManifest = await readAmplifyDeployManifest(amplifyRoot);
	const assetRoute = generatedManifest.routes.find(
		(route) => route.path === "/*.*",
	);
	const catchAllRoute = generatedManifest.routes.find(
		(route) => route.path === "/*",
	);
	if (!assetRoute || !catchAllRoute) {
		throw new Error("Amplify manifest is missing generated fallback routes.");
	}

	const staticRoutes: AmplifyRoute[] = getStaticPublicPaths().map(
		(publicPath) => ({
			path: getStaticFilePath(publicPath),
			target: { kind: "Static" },
		}),
	);
	generatedManifest.routes = [...staticRoutes, assetRoute, catchAllRoute];
	if (generatedManifest.routes.length > 25) {
		throw new Error("Amplify deployment exceeds the 25-route limit.");
	}
	await writeFile(
		manifestPath,
		`${JSON.stringify(generatedManifest, null, 2)}\n`,
	);

	const fixtureAssets = join(amplifyRoot, "static", "test-assets");
	if (mode === "production") {
		await rm(fixtureAssets, { force: true, recursive: true });
	}
	await writeFile(join(amplifyRoot, artifactModeMarker), `${mode}\n`);
}

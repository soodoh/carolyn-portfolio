import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import {
	getStaticFilePath,
	getStaticPublicPaths,
} from "@/lib/amplify-artifact";
import { assertSafeProductionBuildEnvironment } from "@/lib/build-environment";
import manifest from "@/lib/project-auth-manifest.json";
import {
	getContentfulAccessToken,
	getProjectAuthSecret,
} from "@/lib/server-secrets.server";

const amplifyRoot = ".amplify-hosting";
const publicRoot = join(amplifyRoot, "static");
const computeRoot = join(amplifyRoot, "compute", "default");
const maximumComputeBytes = 220 * 1024 * 1024;
const intendedRuntime = "nodejs24.x";
const artifactMode = assertSafeProductionBuildEnvironment(process.env);
const protectedSlugs = new Set(
	Object.entries(manifest)
		.filter(([, auth]) => auth.passwordHash)
		.map(([slug]) => slug),
);
const staticPublicPaths = getStaticPublicPaths();
const requiredPages = staticPublicPaths.map((path) =>
	path === "/" ? "index.html" : `${path.slice(1)}/index.html`,
);

for (const page of requiredPages) {
	await stat(join(publicRoot, page));
}

const aboutHtml = await readFile(
	join(publicRoot, "about", "index.html"),
	"utf8",
);
const aboutPortrait = aboutHtml
	.match(/<img[^>]+alt="Portrait of Carolyn DiLoreto"[^>]*>/)?.[0]
	.toLowerCase();
if (
	!aboutPortrait?.includes('fetchpriority="high"') ||
	aboutPortrait.includes('loading="lazy"')
) {
	throw new Error(
		"The above-the-fold About portrait must be eager and high priority.",
	);
}

async function assertFileMissing(path: string, message: string): Promise<void> {
	try {
		await stat(path);
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") {
			return;
		}
		throw error;
	}
	throw new Error(message);
}

for (const slug of protectedSlugs) {
	await assertFileMissing(
		join(publicRoot, "projects", slug, "index.html"),
		`Protected project was prerendered: ${slug}`,
	);
}
await assertFileMissing(
	join(publicRoot, "resume", "index.html"),
	"Dynamic resume redirect was prerendered",
);
if (artifactMode === "fixture") {
	await stat(join(publicRoot, "test-assets"));
} else {
	await assertFileMissing(
		join(publicRoot, "test-assets"),
		"Local visual-test fixtures were copied into the production artifact",
	);
}

async function findInspectableFiles(directory: string): Promise<string[]> {
	const files: string[] = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await findInspectableFiles(path)));
		} else if (/\.(?:css|html|js|json|map|mjs)$/.test(entry.name)) {
			files.push(path);
		}
	}
	return files;
}

const inspectableFiles = await findInspectableFiles(publicRoot);
const artifactInspectableFiles = await findInspectableFiles(amplifyRoot);
if (inspectableFiles.some((file) => file.endsWith(".map"))) {
	throw new Error("Production client source maps must not be published.");
}
const actualPages = inspectableFiles
	.filter((file) => file.endsWith("index.html"))
	.map((file) => relative(publicRoot, file))
	.sort();
const expectedPages = [...requiredPages].sort();
if (
	actualPages.length !== expectedPages.length ||
	actualPages.some((page, index) => page !== expectedPages[index])
) {
	throw new Error(
		`Prerendered page set differs from the expected public routes.\nExpected: ${expectedPages.join(", ")}\nActual: ${actualPages.join(", ")}`,
	);
}

const referencedTestAssets = new Set<string>();
for (const file of inspectableFiles) {
	const contents = await readFile(file, "utf8");
	for (const match of contents.matchAll(
		/\/test-assets\/[A-Za-z0-9_-]+\.jpg/g,
	)) {
		referencedTestAssets.add(match[0]);
	}
	if (/\$2[aby]\$\d{2}\$/.test(contents)) {
		throw new Error(`Password hash leaked into public output: ${file}`);
	}
	for (const { passwordHash } of Object.values(manifest)) {
		if (passwordHash && contents.includes(passwordHash)) {
			throw new Error(
				`Protected-project hash leaked into public output: ${file}`,
			);
		}
	}
}

if (artifactMode === "fixture") {
	if (referencedTestAssets.size === 0) {
		throw new Error(
			"Fixture artifact contains no local visual asset references.",
		);
	}
	for (const assetPath of referencedTestAssets) {
		await stat(join(publicRoot, assetPath.slice(1)));
	}
} else if (referencedTestAssets.size > 0) {
	throw new Error(
		"Production artifact contains local visual asset references.",
	);
}

if (
	artifactMode === "production" &&
	process.env.HERMETIC_PRODUCTION_BUILD !== "true"
) {
	for (const file of artifactInspectableFiles) {
		if ((await readFile(file, "utf8")).includes("/test-assets/")) {
			throw new Error(
				`Production artifact contains a local visual asset reference: ${file}`,
			);
		}
	}
}

const privateValues: string[] = [];
if (process.env.VERIFY_DEPLOYMENT_SECRETS === "true") {
	privateValues.push(
		...(await Promise.all([
			getContentfulAccessToken(),
			getProjectAuthSecret(),
		])),
	);
}
for (const environmentName of [
	"CONTENTFUL_ACCESS_TOKEN",
	"PROJECT_AUTH_SECRET",
]) {
	const value = process.env[environmentName];
	if (value) {
		privateValues.push(value);
	}
}
for (const file of artifactInspectableFiles) {
	const contents = await readFile(file, "utf8");
	if (privateValues.some((value) => contents.includes(value))) {
		throw new Error(`A secret value was serialized into the artifact: ${file}`);
	}
}

await stat(join(computeRoot, "server.js"));

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

const deployManifest: unknown = JSON.parse(
	await readFile(join(amplifyRoot, "deploy-manifest.json"), "utf8"),
);
if (!isObject(deployManifest) || deployManifest.version !== 1) {
	throw new Error("Amplify deploy manifest must use specification version 1");
}
if (!Array.isArray(deployManifest.computeResources)) {
	throw new Error("Amplify deploy manifest is missing compute resources");
}
const defaultCompute = deployManifest.computeResources.find(
	(resource) => isObject(resource) && resource.name === "default",
);
if (
	!isObject(defaultCompute) ||
	defaultCompute.entrypoint !== "server.js" ||
	defaultCompute.runtime !== intendedRuntime
) {
	throw new Error(
		`Amplify default compute must use server.js on ${intendedRuntime}`,
	);
}
if (!Array.isArray(deployManifest.routes)) {
	throw new Error("Amplify deploy manifest is missing routes");
}
const actualStaticPaths = deployManifest.routes
	.filter(
		(route) =>
			isObject(route) &&
			isObject(route.target) &&
			route.target.kind === "Static" &&
			route.path !== "/*.*",
	)
	.map((route) => (isObject(route) ? route.path : undefined));
const expectedStaticFiles = staticPublicPaths.map(getStaticFilePath);
if (
	actualStaticPaths.length !== expectedStaticFiles.length ||
	actualStaticPaths.some((path, index) => path !== expectedStaticFiles[index])
) {
	throw new Error(
		`Amplify static routes differ from expected emitted files.\nExpected: ${expectedStaticFiles.join(", ")}\nActual: ${actualStaticPaths.join(", ")}`,
	);
}
for (const slug of protectedSlugs) {
	if (actualStaticPaths.includes(getStaticFilePath(`/projects/${slug}`))) {
		throw new Error(`Protected project has a static route: ${slug}`);
	}
}
const assetRoute = deployManifest.routes.at(-2);
if (
	!isObject(assetRoute) ||
	assetRoute.path !== "/*.*" ||
	!isObject(assetRoute.target) ||
	assetRoute.target.kind !== "Static" ||
	!isObject(assetRoute.fallback) ||
	assetRoute.fallback.kind !== "Compute" ||
	assetRoute.fallback.src !== "default"
) {
	throw new Error("Amplify asset route must fall back from static to compute");
}
const catchAllRoute = deployManifest.routes.at(-1);
if (!isObject(catchAllRoute) || catchAllRoute.path !== "/*") {
	throw new Error("Amplify deploy manifest must end with a catch-all route");
}
const catchAllTarget = catchAllRoute.target;
if (
	!isObject(catchAllTarget) ||
	catchAllTarget.kind !== "Compute" ||
	catchAllTarget.src !== "default"
) {
	throw new Error("Amplify catch-all route must target default compute");
}
if (!isObject(deployManifest.framework)) {
	throw new Error("Amplify deploy manifest is missing framework metadata");
}
if (
	deployManifest.framework.name !== "nitro" ||
	typeof deployManifest.framework.version !== "string" ||
	!deployManifest.framework.version
) {
	throw new Error("Amplify deploy manifest has invalid Nitro metadata");
}

async function getDirectorySize(directory: string): Promise<number> {
	let totalBytes = 0;
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			totalBytes += await getDirectorySize(path);
		} else {
			totalBytes += (await stat(path)).size;
		}
	}
	return totalBytes;
}

const computeBytes = await getDirectorySize(computeRoot);
if (computeBytes >= maximumComputeBytes) {
	throw new Error(
		`Amplify compute bundle is ${(computeBytes / 1024 / 1024).toFixed(1)} MiB; it must remain below 220 MiB uncompressed`,
	);
}

process.stdout.write(
	`Verified ${requiredPages.length} prerendered pages, ${protectedSlugs.size} dynamic protected projects, the dynamic resume redirect, a ${(computeBytes / 1024 / 1024).toFixed(1)} MiB Node.js 24 compute bundle, and the Amplify deployment manifest.\n`,
);

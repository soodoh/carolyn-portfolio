import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import manifest from "@/lib/project-auth-manifest.json";
import { getContentfulAccessToken } from "@/lib/server-secrets.server";
import { contentfulFixture } from "@/tests/fixtures/contentful";

const amplifyRoot = ".amplify-hosting";
const publicRoot = join(amplifyRoot, "static");
const computeRoot = join(amplifyRoot, "compute", "default");
const maximumComputeBytes = 220 * 1024 * 1024;
const intendedRuntime = "nodejs24.x";
const protectedSlugs = new Set(
	Object.entries(manifest)
		.filter(([, auth]) => auth.passwordHash)
		.map(([slug]) => slug),
);
const publicProjectSlugs = contentfulFixture.projects
	.map((project) => project.slug)
	.filter((slug) => !protectedSlugs.has(slug));
const requiredPages = [
	"index.html",
	"about/index.html",
	"photography/index.html",
	"projects/index.html",
	...publicProjectSlugs.map((slug) => `projects/${slug}/index.html`),
];

for (const page of requiredPages) {
	await stat(join(publicRoot, page));
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
await assertFileMissing(
	join(publicRoot, "test-assets"),
	"Local visual-test fixtures were copied into the production artifact",
);

async function findInspectableFiles(directory: string): Promise<string[]> {
	const files: string[] = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await findInspectableFiles(path)));
		} else if (/\.(?:html|js|json|map|mjs)$/.test(entry.name)) {
			files.push(path);
		}
	}
	return files;
}

const inspectableFiles = await findInspectableFiles(publicRoot);
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

for (const file of inspectableFiles) {
	const contents = await readFile(file, "utf8");
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

const privateValues: string[] = [];
if (process.env.VERIFY_DEPLOYMENT_SECRETS === "true") {
	privateValues.push(await getContentfulAccessToken());
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
for (const file of await findInspectableFiles(amplifyRoot)) {
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

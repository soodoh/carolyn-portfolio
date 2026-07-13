import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import manifest from "@/lib/project-auth-manifest.json";
import { contentfulFixture } from "@/tests/fixtures/contentful";

const publicRoot = "dist/client";
const protectedSlugs = new Set(Object.keys(manifest));
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

async function findInspectableFiles(directory: string): Promise<string[]> {
	const files: string[] = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await findInspectableFiles(path)));
		} else if (/\.(?:html|js|json|map)$/.test(entry.name)) {
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
	for (const hash of Object.values(manifest)) {
		if (contents.includes(hash)) {
			throw new Error(
				`Protected-project hash leaked into public output: ${file}`,
			);
		}
	}
}

await Promise.all([
	stat(".netlify/v1/functions/server.mjs"),
	stat("dist/server/server.js"),
]);
process.stdout.write(
	`Verified ${requiredPages.length} prerendered pages, ${protectedSlugs.size} dynamic protected projects, the dynamic resume redirect, and the Netlify server output.\n`,
);

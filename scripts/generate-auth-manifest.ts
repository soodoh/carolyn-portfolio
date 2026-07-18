import { writeFile } from "node:fs/promises";
import { hash } from "bcryptjs";
import { buildProjectAuthManifest } from "@/lib/project-auth-manifest-builder";
import { fetchContentfulAuthProjects } from "@/lib/project-auth-source";
import { contentfulFixture } from "@/tests/fixtures/contentful";

const BCRYPT_ROUNDS = 10;

async function main(): Promise<void> {
	const projects =
		process.env.PLAYWRIGHT_TEST === "true"
			? Object.values(contentfulFixture.projectInfo).map(
					({ password, slug }) => ({ password, slug }),
				)
			: await fetchContentfulAuthProjects();
	const manifest = await buildProjectAuthManifest(projects, (password) =>
		hash(password, BCRYPT_ROUNDS),
	);

	const outPath = new URL("../lib/project-auth-manifest.json", import.meta.url);
	await writeFile(outPath.pathname, `${JSON.stringify(manifest, null, 2)}\n`);
	process.stdout.write(
		`Auth manifest written with ${Object.keys(manifest).length} project(s)\n`,
	);
}

await main();

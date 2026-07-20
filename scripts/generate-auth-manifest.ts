import { writeFile } from "node:fs/promises";
import { hash } from "bcryptjs";
import { assertSafeProductionBuildEnvironment } from "@/lib/build-environment";
import { deriveProjectAuthVersion } from "@/lib/password-utils";
import { buildProjectAuthManifest } from "@/lib/project-auth-manifest-builder";
import { getProjectAuthProjects } from "@/lib/project-auth-source";

const BCRYPT_ROUNDS = 10;

async function main(): Promise<void> {
	assertSafeProductionBuildEnvironment(process.env);
	const projects = await getProjectAuthProjects();
	const manifest = await buildProjectAuthManifest(
		projects,
		(password) => hash(password, BCRYPT_ROUNDS),
		deriveProjectAuthVersion,
	);

	const outPath = new URL("../lib/project-auth-manifest.json", import.meta.url);
	await writeFile(outPath.pathname, `${JSON.stringify(manifest, null, 2)}\n`);
	process.stdout.write(
		`Auth manifest written with ${Object.keys(manifest).length} project(s)\n`,
	);
}

await main();

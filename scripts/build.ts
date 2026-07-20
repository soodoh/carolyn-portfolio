import { compare } from "bcryptjs";
import { assertSafeProductionBuildEnvironment } from "@/lib/build-environment";
import { deriveProjectAuthVersion } from "@/lib/password-utils";
import manifest from "@/lib/project-auth-manifest.json";
import { assertProjectAuthManifestCurrent } from "@/lib/project-auth-manifest-builder";
import { getProjectAuthProjects } from "@/lib/project-auth-source";

const artifactMode = assertSafeProductionBuildEnvironment(process.env);

async function runViteBuild(): Promise<void> {
	const build = Bun.spawn(["bunx", "vite", "build"], {
		env: process.env,
		stderr: "inherit",
		stdout: "inherit",
	});
	const exitCode = await build.exited;
	if (exitCode !== 0) {
		throw new Error(`Vite build exited with code ${exitCode}.`);
	}
}

await runViteBuild();
if (artifactMode === "production") {
	await assertProjectAuthManifestCurrent(
		manifest,
		await getProjectAuthProjects(),
		compare,
		deriveProjectAuthVersion,
	);
}

import { join, normalize } from "node:path";
import { readAmplifyArtifactMode } from "@/lib/amplify-artifact";

const computePort = 3000;
const artifactRoot = normalize(join(import.meta.dir, "..", ".amplify-hosting"));
const artifactMode = await readAmplifyArtifactMode(artifactRoot);

const portProbe = Bun.serve({
	hostname: "127.0.0.1",
	port: 0,
	fetch: () => new Response("artifact port probe"),
});
const artifactPort = portProbe.port;
if (artifactPort === undefined) {
	await portProbe.stop(true);
	throw new Error("Bun did not assign an artifact-facing test port.");
}
await portProbe.stop(true);

const unrelatedServer = Bun.serve({
	hostname: "127.0.0.1",
	port: computePort,
	fetch: () => new Response("UNRELATED-PORT-3000"),
});

const artifactServer = Bun.spawn(
	["bun", "run", "scripts/serve-amplify-artifact.ts"],
	{
		env: {
			...process.env,
			ARTIFACT_PORT: String(artifactPort),
			CONTENTFUL_ACCESS_TOKEN: "occupied-port-contentful-token",
			CONTENTFUL_SPACE_ID: "occupied-port-space",
			EXPECTED_ARTIFACT_MODE: artifactMode,
			PLAYWRIGHT_TEST: "true",
			PROJECT_AUTH_SECRET: "playwright-secret",
		},
		stderr: "pipe",
		stdout: "ignore",
	},
);

try {
	const exitCode = await Promise.race([
		artifactServer.exited,
		Bun.sleep(5_000).then(() => undefined),
	]);
	if (exitCode === undefined) {
		throw new Error(
			"Artifact server did not reject an occupied compute port within five seconds.",
		);
	}
	if (exitCode === 0) {
		throw new Error("Artifact server accepted an occupied compute port.");
	}
	const errorOutput = await new Response(artifactServer.stderr).text();
	if (!errorOutput.includes(`compute port ${computePort} is already in use`)) {
		throw new Error(
			`Artifact server failed for an unexpected reason:\n${errorOutput}`,
		);
	}
	try {
		const response = await fetch(`http://127.0.0.1:${artifactPort}/`, {
			signal: AbortSignal.timeout(500),
		});
		throw new Error(
			`Artifact server unexpectedly served status ${response.status} after startup failed.`,
		);
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes("unexpectedly served")
		) {
			throw error;
		}
	}
	process.stdout.write(
		`Artifact server rejected occupied compute port ${computePort}; artifact port ${artifactPort} stayed closed.\n`,
	);
} finally {
	if (artifactServer.exitCode === null) {
		artifactServer.kill();
	}
	await artifactServer.exited;
	await unrelatedServer.stop(true);
}

import { join, normalize } from "node:path";
import {
	type AmplifyRouteTarget,
	getCleanUrlRules,
	matchesAmplifyRoute,
	readAmplifyArtifactMode,
	readAmplifyDeployManifest,
} from "@/lib/amplify-artifact";
import { forwardComputeResponse } from "@/lib/amplify-proxy";
import { assertTcpPortAvailable, parseTcpPort } from "@/lib/artifact-server";

const artifactRoot = normalize(join(import.meta.dir, "..", ".amplify-hosting"));
const staticRoot = join(artifactRoot, "static");
const computeRoot = join(artifactRoot, "compute", "default");
const expectedArtifactMode = process.env.EXPECTED_ARTIFACT_MODE;
if (
	expectedArtifactMode !== "fixture" &&
	expectedArtifactMode !== "production"
) {
	throw new Error(
		"EXPECTED_ARTIFACT_MODE must be fixture or production for artifact smoke tests.",
	);
}
const artifactMode = await readAmplifyArtifactMode(artifactRoot);
if (artifactMode !== expectedArtifactMode) {
	throw new Error(
		`Expected a ${expectedArtifactMode} artifact, but found ${artifactMode}.`,
	);
}
const deployManifest = await readAmplifyDeployManifest(artifactRoot);
const cleanUrlRules = getCleanUrlRules();
const port = parseTcpPort(process.env.ARTIFACT_PORT ?? "4100", "ARTIFACT_PORT");
const computePort = parseTcpPort(
	process.env.ARTIFACT_COMPUTE_PORT ?? "3000",
	"ARTIFACT_COMPUTE_PORT",
);
if (computePort !== 3000) {
	throw new Error(
		"The emitted Amplify compute server requires ARTIFACT_COMPUTE_PORT=3000.",
	);
}
if (port === computePort) {
	throw new Error("ARTIFACT_PORT and ARTIFACT_COMPUTE_PORT must differ.");
}
await assertTcpPortAvailable(port, "Artifact server port");
await assertTcpPortAvailable(computePort);

function spawnCompute() {
	return Bun.spawn(["node", "server.js"], {
		cwd: computeRoot,
		env: {
			...process.env,
			NITRO_PORT: String(computePort),
			PORT: String(computePort),
		},
		stderr: "inherit",
		stdout: "inherit",
	});
}

const compute = spawnCompute();

async function waitForCompute(): Promise<void> {
	const computeExit = compute.exited.then((exitCode) => {
		throw new Error(
			`Amplify compute server exited during startup with code ${exitCode}.`,
		);
	});
	const deadline = Date.now() + 30_000;
	while (Date.now() < deadline) {
		try {
			await Promise.race([
				fetch(`http://127.0.0.1:${computePort}/`, {
					method: "HEAD",
					signal: AbortSignal.timeout(1_000),
				}),
				computeExit,
			]);
			return;
		} catch (error) {
			if (compute.exitCode !== null) {
				throw error;
			}
			await Bun.sleep(100);
		}
	}
	throw new Error("Timed out waiting for the Amplify compute server to start.");
}

function staticFileForPath(pathname: string): string | undefined {
	const path = normalize(join(staticRoot, pathname.slice(1)));
	return path.startsWith(`${staticRoot}/`) ? path : undefined;
}

function targetForPath(pathname: string): AmplifyRouteTarget | undefined {
	return deployManifest.routes.find((route) =>
		matchesAmplifyRoute(pathname, route.path),
	)?.target;
}

function cleanUrlResponse(requestUrl: URL): Response | string {
	const rule = cleanUrlRules.find(
		(candidate) => candidate.source === requestUrl.pathname,
	);
	if (!rule) {
		return requestUrl.pathname;
	}
	if (rule.status === "200") {
		return rule.target;
	}
	return new Response(null, {
		headers: { location: `${rule.target}${requestUrl.search}` },
		status: 301,
	});
}

async function fetchFromCompute(request: Request, requestUrl: URL) {
	const computeUrl = new URL(
		requestUrl.pathname + requestUrl.search,
		`http://127.0.0.1:${computePort}`,
	);
	const headers = new Headers(request.headers);
	headers.delete("host");
	headers.set("connection", "close");
	const body =
		request.method === "GET" || request.method === "HEAD"
			? undefined
			: await request.arrayBuffer();
	return fetch(computeUrl, {
		body,
		headers,
		method: request.method,
		redirect: "manual",
	});
}

try {
	await waitForCompute();
} catch (error) {
	compute.kill();
	throw error;
}

const server = Bun.serve({
	port,
	async fetch(request) {
		const requestUrl = new URL(request.url);
		const cleanUrlResult = cleanUrlResponse(requestUrl);
		if (cleanUrlResult instanceof Response) {
			return cleanUrlResult;
		}

		const target = targetForPath(cleanUrlResult);
		if (target?.kind === "Static") {
			const staticPath = staticFileForPath(cleanUrlResult);
			if (staticPath) {
				const file = Bun.file(staticPath);
				if (await file.exists()) {
					return new Response(file, {
						headers: {
							"content-type": file.type,
							"x-amplify-artifact-route": cleanUrlResult,
							"x-amplify-artifact-target": "static",
						},
					});
				}
			}
			const matchedRoute = deployManifest.routes.find((route) =>
				matchesAmplifyRoute(cleanUrlResult, route.path),
			);
			if (matchedRoute?.fallback?.kind !== "Compute") {
				return new Response("Not Found", { status: 404 });
			}
		}

		requestUrl.pathname = cleanUrlResult;
		const computeResponse = await fetchFromCompute(request, requestUrl);
		return forwardComputeResponse(computeResponse);
	},
});

function shutdown(): void {
	server.stop();
	compute.kill();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.stdout.write(
	`Amplify artifact smoke server listening on ${server.url}\n`,
);

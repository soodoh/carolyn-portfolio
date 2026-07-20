import { defineConfig } from "@playwright/test";

const port = 4100;
const artifactMode = process.env.EXPECTED_ARTIFACT_MODE;
if (artifactMode !== "fixture" && artifactMode !== "production") {
	throw new Error("EXPECTED_ARTIFACT_MODE must be fixture or production");
}
const projectAuthSecret =
	artifactMode === "production"
		? "hermetic-project-secret"
		: "playwright-secret";

export default defineConfig({
	testDir: "tests",
	testMatch: "artifact.smoke.ts",
	fullyParallel: false,
	forbidOnly: Boolean(process.env.CI),
	timeout: 60_000,
	workers: 1,
	retries: 0,
	reporter: [["list"]],
	use: {
		baseURL: `http://127.0.0.1:${port}`,
		colorScheme: "light",
		locale: "en-US",
		screenshot: "only-on-failure",
		trace: "retain-on-failure",
		viewport: { width: 1440, height: 900 },
	},
	webServer: {
		command: `PLAYWRIGHT_TEST=true PROJECT_AUTH_SECRET=${projectAuthSecret} EXPECTED_ARTIFACT_MODE=${artifactMode} ARTIFACT_PORT=${port} bun run scripts/serve-amplify-artifact.ts`,
		url: `http://127.0.0.1:${port}`,
		reuseExistingServer: false,
		timeout: 60_000,
	},
});

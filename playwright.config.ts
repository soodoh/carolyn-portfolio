import { defineConfig } from "@playwright/test";

const port = 4000;
if (
	process.env.EXPECTED_ARTIFACT_MODE !== "production" ||
	process.env.HERMETIC_ARTIFACT_TEST !== "true"
) {
	throw new Error(
		"Visual tests require the production-shaped hermetic Amplify artifact.",
	);
}

export default defineConfig({
	testDir: "tests",
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	snapshotPathTemplate:
		"{testDir}/{testFilePath}-snapshots/{arg}{-projectName}{ext}",
	fullyParallel: false,
	forbidOnly: Boolean(process.env.CI),
	failOnFlakyTests: Boolean(process.env.CI),
	timeout: 180_000,
	workers: 1,
	retries: process.env.CI ? 2 : 0,
	reporter: [["html", { open: "never" }]],
	expect: {
		toHaveScreenshot: {
			animations: "disabled",
			caret: "hide",
			maxDiffPixels: 500,
			threshold: 0.1,
		},
		timeout: 30_000,
	},
	projects: [
		{
			name: "desktop",
			grepInvert: /@mobile-only/,
			use: { viewport: { width: 1440, height: 900 } },
		},
		{
			name: "mobile",
			grepInvert: /@desktop-only/,
			use: {
				viewport: { width: 390, height: 844 },
				isMobile: true,
				hasTouch: true,
			},
		},
	],
	use: {
		baseURL: `http://127.0.0.1:${port}`,
		colorScheme: "light",
		locale: "en-US",
		screenshot: "only-on-failure",
		trace: "retain-on-failure",
	},
	webServer: {
		command: `PLAYWRIGHT_TEST=true PROJECT_AUTH_SECRET=hermetic-project-secret EXPECTED_ARTIFACT_MODE=production ARTIFACT_PORT=${port} bun run scripts/serve-amplify-artifact.ts`,
		url: `http://127.0.0.1:${port}`,
		reuseExistingServer: false,
		timeout: 180_000,
	},
});

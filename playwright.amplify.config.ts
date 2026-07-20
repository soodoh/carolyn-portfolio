import { defineConfig } from "@playwright/test";

const baseURL = process.env.AMPLIFY_BASE_URL;
if (!baseURL) {
	throw new Error("AMPLIFY_BASE_URL is required for deployed smoke tests");
}
if (process.env.CI && !process.env.AMPLIFY_DEFAULT_ORIGIN) {
	throw new Error("AMPLIFY_DEFAULT_ORIGIN is required in CI");
}
if (
	process.env.CI &&
	!/^[a-f0-9]{40}$/.test(process.env.AMPLIFY_EXPECTED_RELEASE_COMMIT ?? "")
) {
	throw new Error(
		"AMPLIFY_EXPECTED_RELEASE_COMMIT must be a 40-character hexadecimal SHA in CI",
	);
}
const deploymentUrl = new URL(baseURL);
if (deploymentUrl.protocol !== "https:") {
	throw new Error("AMPLIFY_BASE_URL must use HTTPS");
}

export default defineConfig({
	testDir: "tests",
	testMatch: "amplify.smoke.ts",
	fullyParallel: false,
	forbidOnly: Boolean(process.env.CI),
	failOnFlakyTests: Boolean(process.env.CI),
	timeout: 60_000,
	workers: 1,
	retries: process.env.CI ? 1 : 0,
	reporter: [["list"]],
	projects: [
		{
			name: "desktop",
			use: { viewport: { width: 1440, height: 900 } },
		},
		{
			name: "mobile",
			use: {
				viewport: { width: 390, height: 844 },
				isMobile: true,
				hasTouch: true,
			},
		},
	],
	use: {
		baseURL: deploymentUrl.toString(),
		colorScheme: "light",
		locale: "en-US",
		screenshot: "only-on-failure",
		trace: "retain-on-failure",
	},
});

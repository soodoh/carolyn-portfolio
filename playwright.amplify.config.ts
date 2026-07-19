import { defineConfig } from "@playwright/test";

const baseURL = process.env.AMPLIFY_BASE_URL;
if (!baseURL) {
	throw new Error("AMPLIFY_BASE_URL is required for deployed smoke tests");
}
const deploymentUrl = new URL(baseURL);
if (deploymentUrl.protocol !== "https:") {
	throw new Error("AMPLIFY_BASE_URL must use HTTPS");
}

export default defineConfig({
	testDir: "tests",
	testMatch: "amplify.smoke.ts",
	fullyParallel: false,
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

import { defineConfig } from "@playwright/test";

const port = 4000;

export default defineConfig({
	testDir: "tests",
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	snapshotPathTemplate:
		"{testDir}/{testFilePath}-snapshots/{arg}{-projectName}{ext}",
	fullyParallel: false,
	timeout: 180_000,
	workers: 1,
	retries: process.env.CI ? 2 : 0,
	reporter: [["html", { open: "never" }]],
	expect: {
		toHaveScreenshot: {
			animations: "disabled",
			caret: "hide",
			maxDiffPixelRatio: 0.001,
		},
		timeout: 30_000,
	},
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
		baseURL: `http://127.0.0.1:${port}`,
		colorScheme: "light",
		locale: "en-US",
		screenshot: "only-on-failure",
		trace: "retain-on-failure",
	},
	webServer: {
		command: `PLAYWRIGHT_TEST=true PROJECT_AUTH_SECRET=playwright-secret bun run dev --host 127.0.0.1 --port ${port}`,
		url: `http://127.0.0.1:${port}`,
		reuseExistingServer: false,
		timeout: 180_000,
	},
});

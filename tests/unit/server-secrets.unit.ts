import { describe, expect, test } from "bun:test";
import { createServerSecretLoader } from "@/lib/server-secrets.server";

const emptyEnvironment: Readonly<Record<string, string | undefined>> = {};

describe("server secret loading", () => {
	test("uses local environment values without querying Parameter Store", async () => {
		let parameterCalls = 0;
		const loader = createServerSecretLoader({
			environment: {
				CONTENTFUL_ACCESS_TOKEN: "local-contentful-token",
				PROJECT_AUTH_SECRET: "local-project-secret",
			},
			getParameter: async () => {
				parameterCalls += 1;
				return undefined;
			},
		});

		expect(await loader.getContentfulAccessToken()).toBe(
			"local-contentful-token",
		);
		expect(await loader.getProjectAuthSecret()).toBe("local-project-secret");
		expect(parameterCalls).toBe(0);
	});

	test("fails closed when required parameters are missing", async () => {
		const loader = createServerSecretLoader({
			environment: emptyEnvironment,
			getParameter: async () => undefined,
		});

		await expect(loader.getContentfulAccessToken()).rejects.toThrow(
			"Missing CONTENTFUL_ACCESS_TOKEN",
		);
		await expect(loader.getProjectAuthSecret()).rejects.toThrow(
			"Missing PROJECT_AUTH_SECRET",
		);
	});

	test("caches successful loading for the lifetime of the process", async () => {
		let parameterCalls = 0;
		const loader = createServerSecretLoader({
			environment: emptyEnvironment,
			getParameter: async () => {
				parameterCalls += 1;
				return "cached-secret";
			},
		});

		const values = await Promise.all([
			loader.getContentfulAccessToken(),
			loader.getContentfulAccessToken(),
		]);
		expect(values).toEqual(["cached-secret", "cached-secret"]);
		expect(parameterCalls).toBe(1);
	});

	test("caches initialization failures without exposing provider details", async () => {
		const sensitiveProviderDetail = "provider-response-with-secret-value";
		let parameterCalls = 0;
		const loader = createServerSecretLoader({
			environment: emptyEnvironment,
			getParameter: async () => {
				parameterCalls += 1;
				throw new Error(sensitiveProviderDetail);
			},
		});

		for (let attempt = 0; attempt < 2; attempt += 1) {
			try {
				await loader.getProjectAuthSecret();
				throw new Error("Expected secret initialization to fail");
			} catch (error) {
				if (!(error instanceof Error)) {
					throw error;
				}
				expect(error.message).toBe(
					"Failed to initialize PROJECT_AUTH_SECRET from AWS Systems Manager Parameter Store",
				);
				expect(error.message).not.toContain(sensitiveProviderDetail);
			}
		}
		expect(JSON.stringify(loader)).not.toContain(sensitiveProviderDetail);
		expect(parameterCalls).toBe(1);
	});
});

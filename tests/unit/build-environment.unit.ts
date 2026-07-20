import { describe, expect, test } from "bun:test";
import { assertSafeProductionBuildEnvironment } from "@/lib/build-environment";

describe("production build environment", () => {
	test("rejects ambient test content flags in production mode", () => {
		for (const environment of [
			{ AMPLIFY_ARTIFACT_MODE: "production", PLAYWRIGHT_TEST: "true" },
			{
				AMPLIFY_ARTIFACT_MODE: "production",
				HERMETIC_PRODUCTION_BUILD: "true",
			},
			{ AMPLIFY_ARTIFACT_MODE: "production", PRODUCTION_BUILD_TEST: "true" },
		]) {
			expect(() => assertSafeProductionBuildEnvironment(environment)).toThrow(
				"cannot use Playwright or hermetic fixture content",
			);
		}
	});

	test("allows fixture builds and the explicit hermetic production test", () => {
		expect(
			assertSafeProductionBuildEnvironment({
				AMPLIFY_ARTIFACT_MODE: "fixture",
				PLAYWRIGHT_TEST: "true",
			}),
		).toBe("fixture");
		expect(
			assertSafeProductionBuildEnvironment({
				AMPLIFY_ARTIFACT_MODE: "production",
				HERMETIC_PRODUCTION_BUILD: "true",
				PLAYWRIGHT_TEST: "true",
				PRODUCTION_BUILD_TEST: "true",
			}),
		).toBe("production");
	});
});

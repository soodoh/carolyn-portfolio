export type ArtifactMode = "fixture" | "production";

type BuildEnvironment = {
	[name: string]: string | undefined;
};

export function getArtifactMode(environment: BuildEnvironment): ArtifactMode {
	const mode = environment.AMPLIFY_ARTIFACT_MODE ?? "production";
	if (mode !== "fixture" && mode !== "production") {
		throw new Error(`Unsupported AMPLIFY_ARTIFACT_MODE: ${mode}`);
	}
	return mode;
}

export function assertSafeProductionBuildEnvironment(
	environment: BuildEnvironment,
): ArtifactMode {
	const mode = getArtifactMode(environment);
	if (mode === "fixture") {
		return mode;
	}

	const playwrightEnabled = environment.PLAYWRIGHT_TEST === "true";
	const hermeticEnabled = environment.HERMETIC_PRODUCTION_BUILD === "true";
	const intentionalProductionTest =
		environment.PRODUCTION_BUILD_TEST === "true" &&
		playwrightEnabled &&
		hermeticEnabled;
	if (
		(playwrightEnabled ||
			hermeticEnabled ||
			environment.PRODUCTION_BUILD_TEST === "true") &&
		!intentionalProductionTest
	) {
		throw new Error(
			"Production builds cannot use Playwright or hermetic fixture content.",
		);
	}
	return mode;
}

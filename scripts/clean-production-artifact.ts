import { prepareAmplifyArtifact } from "@/lib/amplify-artifact";
import { assertSafeProductionBuildEnvironment } from "@/lib/build-environment";

const mode = assertSafeProductionBuildEnvironment(process.env);

await prepareAmplifyArtifact(".amplify-hosting", mode);
process.stdout.write(
	`Prepared ${mode} Amplify artifact with explicit public static routes.\n`,
);

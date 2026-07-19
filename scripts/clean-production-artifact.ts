import { rm } from "node:fs/promises";

const testAssetsPath = ".amplify-hosting/static/test-assets";

await rm(testAssetsPath, { force: true, recursive: true });
process.stdout.write(
	`Removed production-only fixture output at ${testAssetsPath}\n`,
);

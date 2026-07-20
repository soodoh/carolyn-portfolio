import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

const workflowPath = new URL(
	"../../.github/workflows/visual-tests.yml",
	import.meta.url,
);
const amplifyConfigPath = new URL(
	"../../playwright.amplify.config.ts",
	import.meta.url,
);
const packagePath = new URL("../../package.json", import.meta.url);
const amplifySmokePath = new URL("../amplify.smoke.ts", import.meta.url);
const hostingStackPath = new URL(
	"../../infra/lib/hosting-stack.ts",
	import.meta.url,
);

describe("production deployment workflow", () => {
	test("rechecks release ownership immediately before starting Amplify", async () => {
		const workflow = await readFile(workflowPath, "utf8");
		const releaseStep = workflow.indexOf(
			"- name: Start and monitor exact Amplify release",
		);
		const startJob = workflow.indexOf(
			"job_summary=$(aws amplify start-job",
			releaseStep,
		);
		const ownershipCheck = workflow.lastIndexOf(
			'remote_main=$(git ls-remote "https://github.com/$GITHUB_REPOSITORY.git" refs/heads/main | cut -f1)',
			startJob,
		);

		expect(releaseStep).toBeGreaterThan(-1);
		expect(ownershipCheck).toBeGreaterThan(releaseStep);
		expect(startJob).toBeGreaterThan(ownershipCheck);
		expect(workflow.slice(ownershipCheck, startJob)).toContain(
			'if [[ "$remote_main" != "$EXPECTED_SHA" ]]',
		);
		expect(workflow).toContain("if: steps.release.outputs.deployed == 'true'");
	});

	test("guards the production account and deployment output state", async () => {
		const workflow = await readFile(workflowPath, "utf8");
		const identityCheck = workflow.indexOf(
			'[[ "$caller_account" == "$AWS_ACCOUNT_ID" ]]',
		);
		const startJob = workflow.indexOf("job_summary=$(aws amplify start-job");
		const initialOutput = workflow.indexOf(
			'echo "deployed=false" >> "$GITHUB_OUTPUT"',
		);
		const successCase = workflow.indexOf("SUCCEED)", startJob);
		const deployedOutput = workflow.indexOf(
			'echo "deployed=true" >> "$GITHUB_OUTPUT"',
			successCase,
		);

		expect(workflow).toContain('AWS_ACCOUNT_ID: "725669362139"');
		expect(identityCheck).toBeGreaterThan(-1);
		expect(startJob).toBeGreaterThan(identityCheck);
		expect(initialOutput).toBeGreaterThan(-1);
		expect(successCase).toBeGreaterThan(initialOutput);
		expect(deployedOutput).toBeGreaterThan(successCase);
		expect(workflow).toContain("if: steps.release.outputs.deployed == 'true'");
	});

	test("requires and forwards the exact release SHA for CI smoke tests", async () => {
		const [workflow, amplifyConfig] = await Promise.all([
			readFile(workflowPath, "utf8"),
			readFile(amplifyConfigPath, "utf8"),
		]);

		expect(workflow).toMatch(
			/AMPLIFY_EXPECTED_RELEASE_COMMIT: \$\{\{ needs\.release-production-ref\.outputs\.tested_sha \}\}/,
		);
		expect(amplifyConfig).toContain("/^[a-f0-9]{40}$/");
		expect(amplifyConfig).toContain(
			"AMPLIFY_EXPECTED_RELEASE_COMMIT must be a 40-character hexadecimal SHA in CI",
		);
	});

	test("matches AWS OIDC trust to the deployment environment", async () => {
		const [workflow, hostingStack] = await Promise.all([
			readFile(workflowPath, "utf8"),
			readFile(hostingStackPath, "utf8"),
		]);

		expect(workflow).toContain("environment: production");
		expect(hostingStack).toContain(
			'"repo:soodoh/carolyn-portfolio:environment:production"',
		);
		expect(hostingStack).not.toContain(
			'"repo:soodoh/carolyn-portfolio:ref:refs/heads/main"',
		);
	});

	test("uses a production-shaped fixture suite without production passwords", async () => {
		const [workflow, packageJson, amplifySmoke] = await Promise.all([
			readFile(workflowPath, "utf8"),
			readFile(packagePath, "utf8"),
			readFile(amplifySmokePath, "utf8"),
		]);

		const playwrightJob = workflow.slice(
			workflow.indexOf("  playwright:"),
			workflow.indexOf("  release-production-ref:"),
		);
		expect(playwrightJob).toContain("oven-sh/setup-bun@");
		expect(playwrightJob).toContain("run: bun install --frozen-lockfile");
		expect(playwrightJob).toContain("run: bun run test:visual");
		expect(packageJson).toContain("HERMETIC_ARTIFACT_TEST=true");
		expect(packageJson).toContain("build:production:test");
		expect(workflow).not.toContain("AMPLIFY_PROTECTED_PROJECT_PASSWORD");
		expect(amplifySmoke).not.toContain("AMPLIFY_PROTECTED_PROJECT_PASSWORD");
	});
});

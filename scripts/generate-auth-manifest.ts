import { writeFile } from "node:fs/promises";
import { hash } from "bcryptjs";
import type { EntryFieldTypes, EntrySkeletonType } from "contentful";
import { createClient } from "contentful";
import {
	isProjectPasswordWithinLimit,
	MAX_PROJECT_PASSWORD_BYTES,
} from "@/lib/server-function-inputs";
import { contentfulFixture } from "@/tests/fixtures/contentful";

type AuthProjectSkeleton = EntrySkeletonType<
	{
		slug: EntryFieldTypes.Text;
		password: EntryFieldTypes.Text;
	},
	"project"
>;

const BCRYPT_ROUNDS = 10;

function assertProjectPasswordLength(password: string, slug: string): void {
	if (!isProjectPasswordWithinLimit(password)) {
		throw new Error(
			`Password for project ${slug} exceeds bcrypt's ${MAX_PROJECT_PASSWORD_BYTES}-byte limit.`,
		);
	}
}

async function main(): Promise<void> {
	const manifest: Record<string, string> = {};
	if (process.env.PLAYWRIGHT_TEST === "true") {
		for (const project of Object.values(contentfulFixture.projectInfo)) {
			if (project.password) {
				assertProjectPasswordLength(project.password, project.slug);
				manifest[project.slug] = await hash(project.password, BCRYPT_ROUNDS);
			}
		}
	} else {
		const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
		const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
		if (!space || !accessToken) {
			throw new Error(
				"Missing NEXT_PUBLIC_CONTENTFUL_SPACE_ID or NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN",
			);
		}

		const client = createClient({ space, accessToken });
		const entries = await client.getEntries<AuthProjectSkeleton>({
			content_type: "project",
			select: ["fields.slug", "fields.password"],
		});

		for (const item of entries.items) {
			const password = item.fields.password;
			if (password) {
				const slug = String(item.fields.slug);
				const passwordValue = String(password);
				assertProjectPasswordLength(passwordValue, slug);
				manifest[slug] = await hash(passwordValue, BCRYPT_ROUNDS);
			}
		}
	}

	const outPath = new URL("../lib/project-auth-manifest.json", import.meta.url);
	await writeFile(outPath.pathname, `${JSON.stringify(manifest, null, 2)}\n`);
	process.stdout.write(
		`Auth manifest written with ${Object.keys(manifest).length} protected project(s)\n`,
	);
}

await main();

import { writeFile } from "node:fs/promises";
import { hash } from "bcryptjs";
import type { EntryFieldTypes, EntrySkeletonType } from "contentful";
import { createClient } from "contentful";
import { contentfulFixture } from "@/tests/fixtures/contentful";

type AuthProjectSkeleton = EntrySkeletonType<
	{
		slug: EntryFieldTypes.Text;
		password: EntryFieldTypes.Text;
	},
	"project"
>;

const BCRYPT_ROUNDS = 10;

async function main(): Promise<void> {
	const manifest: Record<string, string> = {};
	if (process.env.PLAYWRIGHT_TEST === "true") {
		for (const project of Object.values(contentfulFixture.projectInfo)) {
			if (project.password) {
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
				manifest[slug] = await hash(String(password), BCRYPT_ROUNDS);
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

import type { EntryFieldTypes, EntrySkeletonType } from "contentful";
import { createClient } from "contentful";
import type { ProjectAuthSource } from "@/lib/project-auth-manifest-builder";

const CONTENTFUL_PAGE_SIZE = 1000;

type AuthProjectSkeleton = EntrySkeletonType<
	{
		slug: EntryFieldTypes.Text;
		password: EntryFieldTypes.Text;
	},
	"project"
>;

export async function fetchContentfulAuthProjects(): Promise<
	ProjectAuthSource[]
> {
	const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
	const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
	if (!space || !accessToken) {
		throw new Error(
			"Missing NEXT_PUBLIC_CONTENTFUL_SPACE_ID or NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN",
		);
	}

	const client = createClient({ space, accessToken });
	const projects: ProjectAuthSource[] = [];
	let skip = 0;
	let total = 0;

	do {
		const entries = await client.getEntries<AuthProjectSkeleton>({
			content_type: "project",
			select: ["fields.slug", "fields.password"],
			limit: CONTENTFUL_PAGE_SIZE,
			skip,
		});
		total = entries.total;

		for (const item of entries.items) {
			const { password, slug } = item.fields;
			if (typeof slug !== "string") {
				throw new Error(`Project ${item.sys.id} is missing a slug.`);
			}
			projects.push({
				slug,
				password:
					typeof password === "string" && password ? password : undefined,
			});
		}
		skip += entries.items.length;
	} while (skip < total);

	return projects;
}

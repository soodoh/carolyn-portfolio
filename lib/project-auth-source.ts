import type { EntryFieldTypes, EntrySkeletonType } from "contentful";
import { getContentfulClient } from "@/lib/contentful-utils";
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
	const client = await getContentfulClient();
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

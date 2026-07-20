import type { EntryFieldTypes, EntrySkeletonType } from "contentful";
import type { ContentfulDeliveryClient } from "@/lib/content-source";
import {
	getAllContentfulEntries,
	getContentfulClient,
} from "@/lib/contentful-utils";
import type { ProjectAuthSource } from "@/lib/project-auth-manifest-builder";

const CONTENTFUL_PAGE_SIZE = 1000;

type AuthProjectSkeleton = EntrySkeletonType<
	{
		slug: EntryFieldTypes.Text;
		password: EntryFieldTypes.Text;
	},
	"project"
>;

export async function getProjectAuthProjects(): Promise<ProjectAuthSource[]> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		const { contentfulFixture } = await import("@/tests/fixtures/contentful");
		return Object.values(contentfulFixture.projectInfo).map(
			({ password, slug }) => ({ password, slug }),
		);
	}
	return fetchContentfulAuthProjects();
}

export async function fetchContentfulAuthProjects(
	injectedClient?: ContentfulDeliveryClient,
): Promise<ProjectAuthSource[]> {
	const client: ContentfulDeliveryClient =
		injectedClient ?? (await getContentfulClient());
	const entries = await getAllContentfulEntries(
		(skip, limit) =>
			client.getEntries<AuthProjectSkeleton>({
				content_type: "project",
				select: ["fields.slug", "fields.password"],
				limit,
				skip,
			}),
		"Project authorization query",
		CONTENTFUL_PAGE_SIZE,
	);
	return entries.map((item) => {
		const { password, slug } = item.fields;
		if (typeof slug !== "string") {
			throw new Error(`Project ${item.sys.id} is missing a slug.`);
		}
		if (password !== undefined && typeof password !== "string") {
			throw new Error(`Project ${item.sys.id} has a malformed password field.`);
		}
		return {
			slug,
			password: password || undefined,
		};
	});
}

import type { ContentfulFixture } from "@/lib/contentful-fixture-types";

export async function loadContentfulFixture(): Promise<ContentfulFixture> {
	const { contentfulFixture } = await import("@/tests/fixtures/contentful");
	return contentfulFixture;
}

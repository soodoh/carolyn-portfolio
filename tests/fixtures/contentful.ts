import type { ContentfulFixture } from "@/lib/contentful-fixture-types";
import rawFixture from "@/tests/fixtures/contentful.json";

export const contentfulFixture: ContentfulFixture = JSON.parse(
	JSON.stringify(rawFixture),
);

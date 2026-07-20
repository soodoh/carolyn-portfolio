import { parseContentfulFixture } from "@/lib/contentful-fixture-types";
import rawFixture from "@/tests/fixtures/contentful.json";

export const contentfulFixture = parseContentfulFixture(
	JSON.parse(JSON.stringify(rawFixture)),
);

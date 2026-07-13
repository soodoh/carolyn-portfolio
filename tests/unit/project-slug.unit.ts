import { describe, expect, test } from "bun:test";
import {
	buildProjectSlugQuery,
	findProjectByExactSlug,
} from "@/lib/project-slug";

describe("exact project slug lookup", () => {
	test("uses an exact Contentful query and rejects fuzzy results", () => {
		expect(buildProjectSlugQuery("magnolia")).toEqual({
			content_type: "project",
			"fields.slug": "magnolia",
			include: 1,
		});
		expect(
			findProjectByExactSlug(
				[{ fields: { slug: "magnolia-app" } }],
				"magnolia",
			),
		).toBeUndefined();
	});
});

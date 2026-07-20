import { describe, expect, test } from "bun:test";
import type { ContentSourceLoader } from "@/lib/content-source";
import manifest from "@/lib/project-auth-manifest.json";
import {
	assertFixtureProjectSlugCorrespondence,
	loadContentfulFixtureProjects,
} from "@/scripts/contentful-fixture-projects";
import { contentfulFixture } from "@/tests/fixtures/contentful";

function requireFixtureProject() {
	const project = contentfulFixture.projects[0];
	const detail = project
		? contentfulFixture.projectInfo[project.slug]
		: undefined;
	if (!project || !detail) {
		throw new Error("Fixture requires at least one project.");
	}
	return { detail, project };
}

describe("Contentful fixture project capture", () => {
	test("captures a project that is absent from the prior release manifest", async () => {
		const fixture = structuredClone(contentfulFixture);
		const { detail, project } = requireFixtureProject();
		const slug = "post-release-project";
		fixture.projects.push({ ...project, id: slug, slug });
		fixture.projectInfo[slug] = { ...detail, id: slug, slug };
		const loadSource: ContentSourceLoader = async () => ({
			kind: "fixture",
			content: fixture,
		});
		const loadAuthProjects = async () =>
			Object.values(fixture.projectInfo).map(
				({ password, slug: authSlug }) => ({
					password,
					slug: authSlug,
				}),
			);

		expect(Object.hasOwn(manifest, slug)).toBe(false);
		const records = await loadContentfulFixtureProjects(
			loadSource,
			loadAuthProjects,
		);
		expect(records.projects.map((item) => item.slug)).toContain(slug);
		expect(records.projectInfos.map((item) => item.slug)).toContain(slug);
		expect(records.authProjects.map((item) => item.slug)).toContain(slug);
	});

	test("rejects missing, extra, and duplicate project record slugs", () => {
		const { detail, project } = requireFixtureProject();
		expect(() =>
			assertFixtureProjectSlugCorrespondence([project], [detail], []),
		).toThrow("exact project summary, detail, and authorization slug");
		expect(() =>
			assertFixtureProjectSlugCorrespondence(
				[project, project],
				[detail],
				[{ slug: project.slug }],
			),
		).toThrow("duplicate project summary slugs");
	});
});

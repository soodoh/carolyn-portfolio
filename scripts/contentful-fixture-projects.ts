import {
	type ContentSourceLoader,
	getContentSource,
} from "@/lib/content-source";
import {
	getProjectPageSnapshotFromSource,
	getProjectsFromSource,
} from "@/lib/fetch-projects";
import type { ProjectAuthSource } from "@/lib/project-auth-manifest-builder";
import { fetchContentfulAuthProjects } from "@/lib/project-auth-source";
import type { Project, ProjectInfo } from "@/lib/types";

type FixtureProjectRecords = {
	authProjects: ProjectAuthSource[];
	projectInfos: ProjectInfo[];
	projects: Project[];
};

function getUniqueSlugs(records: { slug: string }[], label: string): string[] {
	const slugs = records.map((record) => record.slug);
	if (new Set(slugs).size !== slugs.length) {
		throw new Error(`Contentful fixture capture has duplicate ${label} slugs.`);
	}
	return slugs.toSorted();
}

export function assertFixtureProjectSlugCorrespondence(
	projects: Project[],
	projectInfos: ProjectInfo[],
	authProjects: ProjectAuthSource[],
): void {
	const projectSlugs = getUniqueSlugs(projects, "project summary");
	const detailSlugs = getUniqueSlugs(projectInfos, "project detail");
	const authSlugs = getUniqueSlugs(authProjects, "authorization");
	if (
		projectSlugs.join("\n") !== detailSlugs.join("\n") ||
		projectSlugs.join("\n") !== authSlugs.join("\n")
	) {
		throw new Error(
			"Contentful fixture capture requires exact project summary, detail, and authorization slug correspondence.",
		);
	}
}

export async function loadContentfulFixtureProjects(
	loadSource: ContentSourceLoader = getContentSource,
	loadAuthProjects: () => Promise<
		ProjectAuthSource[]
	> = fetchContentfulAuthProjects,
): Promise<FixtureProjectRecords> {
	const [projects, authProjects] = await Promise.all([
		getProjectsFromSource(loadSource),
		loadAuthProjects(),
	]);
	const projectSnapshots = await Promise.all(
		projects.map((project) =>
			getProjectPageSnapshotFromSource(project.slug, loadSource),
		),
	);
	const projectInfos = projectSnapshots.map((snapshot) => snapshot.projectInfo);
	assertFixtureProjectSlugCorrespondence(projects, projectInfos, authProjects);
	return { authProjects, projectInfos, projects };
}

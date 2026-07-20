import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import { BLOCKS } from "@contentful/rich-text-types";
import {
	type ContentSourceLoader,
	getContentSource,
} from "@/lib/content-source";
import type { ProjectSkeleton } from "@/lib/contentful-types";
import {
	type ContentfulEntry,
	formatImage,
	getAllContentfulEntries,
	getImageAssetFromRichTextNode,
	parseContentfulEntries,
	requireContentfulAsset,
} from "@/lib/contentful-utils";
import { isReleasedProjectSlug } from "@/lib/project-auth";
import type { ProjectAuthorizationSnapshot } from "@/lib/project-authorization";
import {
	isProjectType,
	type Project,
	type ProjectInfo,
	type ProjectType,
} from "@/lib/types";

export class ProjectNotFoundError extends Error {
	constructor(slug: string) {
		super(`Project not found: ${slug}`);
		this.name = "ProjectNotFoundError";
	}
}

function getProjectTypes(value: unknown, projectId: string): ProjectType[] {
	if (!Array.isArray(value) || !value.every(isProjectType)) {
		throw new Error(`Project ${projectId} has invalid project types.`);
	}
	return value;
}

function requireText(value: unknown, context: string): string {
	if (typeof value !== "string" || !value) {
		throw new Error(`${context} is missing.`);
	}
	return value;
}

function getMarkdownImage(node: unknown): { url: string; alt: string } {
	if (
		typeof node !== "object" ||
		node === null ||
		!("url" in node) ||
		typeof node.url !== "string"
	) {
		throw new Error("Project markdown image is missing a URL.");
	}
	return {
		url: node.url,
		alt: "alt" in node && typeof node.alt === "string" ? node.alt : "",
	};
}

export function normalizeVideoLink(
	rawLink: string | undefined,
): string | undefined {
	if (!rawLink) {
		return undefined;
	}

	let url: URL;
	try {
		url = new URL(rawLink);
	} catch {
		return undefined;
	}
	if (url.protocol !== "https:" || url.port || url.username || url.password) {
		return undefined;
	}

	const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
	if (hostname === "youtu.be" || hostname === "youtube.com") {
		const videoId =
			hostname === "youtu.be"
				? url.pathname.split("/").filter(Boolean)[0]
				: url.pathname.startsWith("/embed/")
					? url.pathname.split("/")[2]
					: url.pathname === "/watch"
						? (url.searchParams.get("v") ?? undefined)
						: undefined;
		return videoId && /^[\w-]+$/.test(videoId)
			? `https://www.youtube.com/embed/${videoId}`
			: undefined;
	}

	if (hostname === "vimeo.com" || hostname === "player.vimeo.com") {
		const pathParts = url.pathname.split("/").filter(Boolean);
		const videoId = pathParts.findLast((part) => /^\d+$/.test(part));
		if (!videoId) {
			return undefined;
		}
		const embedUrl = new URL(`https://player.vimeo.com/video/${videoId}`);
		embedUrl.searchParams.set("title", "0");
		embedUrl.searchParams.set("byline", "0");
		embedUrl.searchParams.set("portrait", "0");
		return embedUrl.toString();
	}

	return undefined;
}

function formatBaseProject(item: ContentfulEntry): Project {
	return {
		id: item.sys.id,
		title: requireText(item.fields.title, `Project ${item.sys.id} title`),
		summary: requireText(item.fields.summary, `Project ${item.sys.id} summary`),
		slug: requireText(item.fields.slug, `Project ${item.sys.id} slug`),
		coverImage: formatImage(
			requireContentfulAsset(
				item.fields.coverImage,
				`Project ${item.sys.id} cover image`,
			),
		),
		projectType: getProjectTypes(item.fields.projectType, item.sys.id),
	};
}

export function getProjects(): Promise<Project[]> {
	return getProjectsFromSource(getContentSource, isReleasedProjectSlug);
}

function requireUniqueProjectSlugs(projects: Project[]): Project[] {
	const slugs = new Set<string>();
	for (const project of projects) {
		if (slugs.has(project.slug)) {
			throw new Error(`Duplicate released project slug: ${project.slug}`);
		}
		slugs.add(project.slug);
	}
	return projects;
}

export function filterProjectsToRelease(
	projects: Project[],
	isReleased: (slug: string) => boolean = isReleasedProjectSlug,
): Project[] {
	return requireUniqueProjectSlugs(
		projects.filter((project) => isReleased(project.slug)),
	);
}

export async function getProjectsFromSource(
	loadSource: ContentSourceLoader,
	isReleased: (slug: string) => boolean = () => true,
): Promise<Project[]> {
	const source = await loadSource();
	if (source.kind === "fixture") {
		return filterProjectsToRelease(source.content.projects, isReleased);
	}

	const projects = await getAllContentfulEntries(
		(skip, limit) =>
			source.client.getEntries<ProjectSkeleton>({
				content_type: "project",
				limit,
				skip,
				order: ["fields.order"],
				select: [
					"fields.title",
					"fields.slug",
					"fields.summary",
					"fields.coverImage",
					"fields.projectType",
				],
			}),
		"Projects query",
	);
	return requireUniqueProjectSlugs(
		projects
			.filter(
				(project) =>
					typeof project.fields.slug === "string" &&
					isReleased(project.fields.slug),
			)
			.map(formatBaseProject),
	);
}

export type ProjectPageSnapshot = ProjectAuthorizationSnapshot & {
	projectInfo: ProjectInfo;
};

function getExactProject(
	value: unknown,
	slug: string,
	context: string,
): ContentfulEntry {
	const entries = parseContentfulEntries(value, context);
	const exactMatches = entries.items.filter(
		(item) => item.fields.slug === slug,
	);
	if (entries.total === 0 && exactMatches.length === 0) {
		throw new ProjectNotFoundError(slug);
	}
	if (
		entries.total !== 1 ||
		entries.items.length !== 1 ||
		exactMatches.length !== 1
	) {
		throw new Error(
			`${context} did not return exactly one project for slug ${slug}.`,
		);
	}
	return exactMatches[0];
}

function getProjectPassword(projectItem: ContentfulEntry): string | undefined {
	const password = projectItem.fields.password;
	if (password !== undefined && typeof password !== "string") {
		throw new Error(
			`Project ${projectItem.sys.id} has a malformed password field.`,
		);
	}
	return password || undefined;
}

export function getProjectAuthorizationSnapshot(
	slug: string,
): Promise<ProjectAuthorizationSnapshot> {
	return getProjectAuthorizationSnapshotFromSource(slug, getContentSource);
}

export async function getProjectAuthorizationSnapshotFromSource(
	slug: string,
	loadSource: ContentSourceLoader,
): Promise<ProjectAuthorizationSnapshot> {
	const source = await loadSource();
	if (source.kind === "fixture") {
		const project = source.content.projectInfo[slug];
		if (!Object.hasOwn(source.content.projectInfo, slug) || !project) {
			throw new ProjectNotFoundError(slug);
		}
		if (project.slug !== slug) {
			throw new Error(
				`Project authorization query did not return exactly one project for slug ${slug}.`,
			);
		}
		return { password: project.password || undefined };
	}

	const projectItem = getExactProject(
		await source.client.getEntries<ProjectSkeleton>({
			content_type: "project",
			"fields.slug": slug,
			limit: 2,
			select: ["fields.slug", "fields.password"],
		}),
		slug,
		"Project authorization query",
	);
	return { password: getProjectPassword(projectItem) };
}

export async function getProjectInfo(slug: string): Promise<ProjectInfo> {
	return (await getProjectPageSnapshot(slug)).projectInfo;
}

export async function getProjectInfoFromSource(
	slug: string,
	loadSource: ContentSourceLoader,
): Promise<ProjectInfo> {
	return (await getProjectPageSnapshotFromSource(slug, loadSource)).projectInfo;
}

export function getProjectPageSnapshot(
	slug: string,
): Promise<ProjectPageSnapshot> {
	return getProjectPageSnapshotFromSource(slug, getContentSource);
}

export async function getProjectPageSnapshotFromSource(
	slug: string,
	loadSource: ContentSourceLoader,
): Promise<ProjectPageSnapshot> {
	const source = await loadSource();
	if (source.kind === "fixture") {
		const project = source.content.projectInfo[slug];
		if (!Object.hasOwn(source.content.projectInfo, slug) || !project) {
			throw new ProjectNotFoundError(slug);
		}
		if (project.slug !== slug) {
			throw new Error(
				`Project detail query did not return exactly one project for slug ${slug}.`,
			);
		}
		const { password, ...projectInfo } = project;
		return { projectInfo, password: password || undefined };
	}

	const projectItem = getExactProject(
		await source.client.getEntries<ProjectSkeleton>({
			content_type: "project",
			"fields.slug": slug,
			include: 1,
			limit: 2,
			select: [
				"fields.title",
				"fields.slug",
				"fields.summary",
				"fields.coverImage",
				"fields.projectType",
				"fields.role",
				"fields.description",
				"fields.videoLink",
				"fields.password",
			],
		}),
		slug,
		"Project detail query",
	);

	const password = getProjectPassword(projectItem);
	const description = requireText(
		projectItem.fields.description,
		`Project ${projectItem.sys.id} description`,
	);
	const loadProjectAsset = (assetId: string) => source.client.getAsset(assetId);
	const descriptionDocument = await richTextFromMarkdown(
		description,
		async (node) => {
			const image = getMarkdownImage(node);
			return {
				nodeType: BLOCKS.EMBEDDED_ASSET,
				content: [],
				data: {
					image: await getImageAssetFromRichTextNode(
						loadProjectAsset,
						image.url,
						image.alt,
					),
				},
			};
		},
	);

	return {
		password: password || undefined,
		projectInfo: {
			...formatBaseProject(projectItem),
			role:
				typeof projectItem.fields.role === "string" && projectItem.fields.role
					? projectItem.fields.role
					: undefined,
			description: descriptionDocument,
			videoLink: normalizeVideoLink(
				typeof projectItem.fields.videoLink === "string"
					? projectItem.fields.videoLink
					: undefined,
			),
		},
	};
}

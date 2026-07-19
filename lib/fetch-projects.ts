import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import { BLOCKS } from "@contentful/rich-text-types";
import pAll from "p-all";
import type { ProjectSkeleton } from "@/lib/contentful-types";
import {
	formatImage,
	getContentfulClient,
	getImageAssetFromRichTextNode,
	requireContentfulAsset,
} from "@/lib/contentful-utils";
import { loadContentfulFixture } from "@/lib/load-contentful-fixture";
import type { Project, ProjectInfo, ProjectType } from "@/lib/types";

export class ProjectNotFoundError extends Error {
	constructor(slug: string) {
		super(`Project not found: ${slug}`);
		this.name = "ProjectNotFoundError";
	}
}

function isProjectType(value: unknown): value is ProjectType {
	return ["Design", "Film", "Interactive", "Animation"].includes(
		typeof value === "string" ? value : "",
	);
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
		return rawLink;
	}

	const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
	if (hostname === "youtu.be" || hostname === "youtube.com") {
		const videoId =
			hostname === "youtu.be"
				? url.pathname.split("/").filter(Boolean)[0]
				: url.pathname.startsWith("/embed/")
					? url.pathname.split("/")[2]
					: (url.searchParams.get("v") ?? undefined);
		return videoId && /^[\w-]+$/.test(videoId)
			? `https://www.youtube.com/embed/${videoId}`
			: rawLink;
	}

	if (hostname === "vimeo.com" || hostname === "player.vimeo.com") {
		const videoId = url.pathname
			.split("/")
			.filter(Boolean)
			.findLast((part) => /^\d+$/.test(part));
		if (!videoId) {
			return rawLink;
		}
		const embedUrl = new URL(`https://player.vimeo.com/video/${videoId}`);
		embedUrl.searchParams.set("title", "0");
		embedUrl.searchParams.set("byline", "0");
		embedUrl.searchParams.set("portrait", "0");
		return embedUrl.toString();
	}

	return rawLink;
}

export async function getProjects(): Promise<Project[]> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		return (await loadContentfulFixture()).projects;
	}

	const contentfulClient = await getContentfulClient();
	const projectData = await contentfulClient.getEntries<ProjectSkeleton>({
		content_type: "project",
		order: ["fields.order"],
		select: [
			"fields.title",
			"fields.slug",
			"fields.summary",
			"fields.coverImage",
			"fields.projectType",
		],
	});

	const promises = projectData.items.map(
		(item) => async (): Promise<Project> => ({
			id: item.sys.id,
			title: requireText(item.fields.title, `Project ${item.sys.id} title`),
			summary: requireText(
				item.fields.summary,
				`Project ${item.sys.id} summary`,
			),
			slug: requireText(item.fields.slug, `Project ${item.sys.id} slug`),
			coverImage: await formatImage(
				requireContentfulAsset(
					item.fields.coverImage,
					`Project ${item.sys.id} cover image`,
				),
			),
			projectType: getProjectTypes(item.fields.projectType, item.sys.id),
		}),
	);
	return pAll(promises, { concurrency: 10 });
}

export async function getProjectInfo(slug: string): Promise<ProjectInfo> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		const { projectInfo } = await loadContentfulFixture();
		if (!Object.hasOwn(projectInfo, slug)) {
			throw new ProjectNotFoundError(slug);
		}
		const { password: _password, ...project } = projectInfo[slug];
		return project;
	}

	const contentfulClient = await getContentfulClient();
	const projectQuery = await contentfulClient.getEntries<ProjectSkeleton>({
		content_type: "project",
		"fields.slug": slug,
		include: 1,
		select: [
			"fields.title",
			"fields.slug",
			"fields.summary",
			"fields.coverImage",
			"fields.projectType",
			"fields.role",
			"fields.description",
			"fields.videoLink",
		],
	});
	const projectItem = projectQuery.items.find(
		(item) => item.fields.slug === slug,
	);
	if (!projectItem) {
		throw new ProjectNotFoundError(slug);
	}

	const description = requireText(
		projectItem.fields.description,
		`Project ${projectItem.sys.id} description`,
	);
	const [coverImage, descriptionDocument] = await Promise.all([
		formatImage(
			requireContentfulAsset(
				projectItem.fields.coverImage,
				`Project ${projectItem.sys.id} cover image`,
			),
		),
		richTextFromMarkdown(description, async (node) => {
			const image = getMarkdownImage(node);
			return {
				nodeType: BLOCKS.EMBEDDED_ASSET,
				content: [],
				data: {
					image: await getImageAssetFromRichTextNode(image.url, image.alt),
				},
			};
		}),
	]);

	return {
		id: projectItem.sys.id,
		title: requireText(
			projectItem.fields.title,
			`Project ${projectItem.sys.id} title`,
		),
		summary: requireText(
			projectItem.fields.summary,
			`Project ${projectItem.sys.id} summary`,
		),
		slug: requireText(
			projectItem.fields.slug,
			`Project ${projectItem.sys.id} slug`,
		),
		coverImage,
		projectType: getProjectTypes(
			projectItem.fields.projectType,
			projectItem.sys.id,
		),
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
	};
}

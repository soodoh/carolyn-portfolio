import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import { BLOCKS } from "@contentful/rich-text-types";
import type { Asset as ContentfulAsset } from "contentful";
import pAll from "p-all";
import type { ProjectSkeleton } from "@/lib/contentful-types";
import {
	formatImage,
	getContentfulClient,
	getImageAssetFromRichTextNode,
} from "@/lib/contentful-utils";
import { loadContentfulFixture } from "@/lib/load-contentful-fixture";
import type { Project, ProjectInfo, ProjectType } from "@/lib/types";

export class ProjectNotFoundError extends Error {
	constructor(slug: string) {
		super(`Project not found: ${slug}`);
		this.name = "ProjectNotFoundError";
	}
}

function getLink(rawLink: string | undefined): string | undefined {
	if (!rawLink) {
		return undefined;
	}
	const link = rawLink;
	if (/vimeo/gi.test(link)) {
		return `${link}?title=0&byline=0&portrait=0`;
	}
	if (/youtu\.?be/gi.test(link)) {
		const videoId = link.match(/\w+$/)?.pop();
		return videoId ? `https://www.youtube.com/embed/${videoId}` : link;
	}
	return link;
}

export async function getProjects(): Promise<Project[]> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		return (await loadContentfulFixture()).projects;
	}

	const projectData = await getContentfulClient().getEntries<ProjectSkeleton>({
		content_type: "project",
		order: ["fields.order"],
	});

	const promises: Array<() => Promise<Project>> = projectData.items.map(
		(item) => async () => {
			const coverImage = await formatImage(
				item.fields.coverImage as ContentfulAsset,
			);
			return {
				id: String(item.sys.id),
				title: String(item.fields.title),
				summary: String(item.fields.summary),
				slug: String(item.fields.slug),
				coverImage: coverImage,
				projectType: item.fields.projectType as ProjectType[],
			};
		},
	);
	return pAll(promises, { concurrency: 10 });
}

export async function getProjectInfo(slug: string): Promise<ProjectInfo> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		const { projectInfo } = await loadContentfulFixture();
		if (!Object.hasOwn(projectInfo, slug)) {
			throw new ProjectNotFoundError(slug);
		}
		return projectInfo[slug];
	}

	const projectQuery = await getContentfulClient().getEntries<ProjectSkeleton>({
		content_type: "project",
		"fields.slug": slug,
		include: 1,
	});
	const projectItem = projectQuery.items.find(
		(item) => String(item.fields.slug) === slug,
	);
	if (!projectItem) {
		throw new ProjectNotFoundError(slug);
	}
	const coverImage = await formatImage(
		projectItem.fields.coverImage as ContentfulAsset,
	);
	const descriptionDocument = await richTextFromMarkdown(
		String(projectItem.fields.description),
		async (node) => {
			const url = (node as unknown as { url: string }).url;
			const alt = (node as unknown as { alt: string }).alt;
			return {
				nodeType: BLOCKS.EMBEDDED_ASSET,
				content: [],
				data: {
					image: await getImageAssetFromRichTextNode(url, alt),
				},
			};
		},
	);

	return {
		id: String(projectItem.sys.id),
		title: String(projectItem.fields.title),
		summary: String(projectItem.fields.summary),
		slug: String(projectItem.fields.slug),
		coverImage: coverImage,
		projectType: projectItem.fields.projectType as ProjectType[],
		role: projectItem.fields.role ? String(projectItem.fields.role) : undefined,
		description: descriptionDocument,
		videoLink: getLink(projectItem.fields.videoLink),
		password: projectItem.fields.password
			? String(projectItem.fields.password)
			: undefined,
	};
}

import { marked } from 'marked';
import pAll from 'p-all';
import { client, formatImage } from './contentful';
import { createImage } from './images';
import type { BaseProject, Project, ProjectType } from '$lib/types';
import type { Asset as ContentfulAsset, Entry } from 'contentful';
import LayoutImage from '$lib/components/LayoutImage.svelte';

function getLink(rawLink: unknown): string | null {
	if (!rawLink) return null;
	const link = String(rawLink);
	if (/vimeo/gi.test(link)) {
		return `${link}?title=0&byline=0&portrait=0`;
	}
	if (/youtu\.?be/gi.test(link)) {
		const videoId = link.match(/\w+$/)?.pop();
		return videoId ? `https://www.youtube.com/embed/${videoId}` : link;
	}
	return link;
}

async function parseMarkdown(source: string) {
	marked.use({
		async: true,
		walkTokens: async (token) => {
			if (token.type === 'image') {
				const image = await createImage(token.href, token.text);
				const srcset = [414, 700, 1000];
				const sizes = '100vw';
				// @ts-expect-error SSR svelte types are incorrect
				const { css, html } = LayoutImage.render({ image, srcset, sizes, useSSR: true });
				token.text = `${html}<style>${css.code}</style>`;
			}
		},
		renderer: {
			image: (_href, _title, text) => String(text)
		}
	});
	return marked.parse(source);
}

function assetIdentity(asset: unknown) {
	return asset as ContentfulAsset;
}

export async function formatProject(item: Entry, useBase = false) {
	const coverImageAsset = assetIdentity(item.fields.coverImage);
	const coverImage = await formatImage(coverImageAsset);
	const baseProject: BaseProject = {
		id: String(item.sys.id),
		title: String(item.fields.title),
		slug: String(item.fields.slug),
		coverImage: coverImage,
		projectType: item.fields.projectType as ProjectType[],
		summary: String(item.fields.summary)
	};
	if (useBase) {
		return baseProject;
	}
	const project: Project = {
		...baseProject,
		role: item.fields.role ? String(item.fields.role) : null,
		description: await parseMarkdown(String(item.fields.description)),
		videoLink: getLink(item.fields.videoLink),
		password: item.fields.password ? String(item.fields.password) : null
	};
	return project;
}

export default async function getProjects(): Promise<BaseProject[]> {
	const projectData = await client.getEntries({
		content_type: 'project',
		order: ['fields.order']
	});
	const promises = projectData.items.map((project) => () => formatProject(project, true))
	return pAll(promises, { concurrency: 10 });
}

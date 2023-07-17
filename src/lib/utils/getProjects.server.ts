import { marked } from 'marked';
import { createImage } from './images';
import type { Project, ProjectType } from '$lib/types';
import type { Asset as ContentfulAsset, Entry } from 'contentful';
import LayoutImage from '$lib/components/LayoutImage.svelte';
import { client, formatImage } from '$lib/utils/contentful';

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
		mangle: false,
		headerIds: false,
		async: true,
		walkTokens: async (token) => {
			if (token.type === 'image') {
				const image = await createImage(token.href, token.text);
				const srcset = [414, 700, 1000];
				const sizes = '100vw';
				// @ts-expect-error SSR svelte types are incorrect
				const { css, html } = LayoutImage.render({ image, srcset, sizes });
				token.text = `${html}<style>${css.code}</style>`;
			}
		},
		renderer: {
			image: (href, title, text) => String(text)
		}
	});
	return marked.parse(source);
}

export async function formatProject(item: Entry) {
	const coverImage = await formatImage(item.fields.coverImage as ContentfulAsset);
	const project: Project = {
		id: String(item.sys.id),
		title: String(item.fields.title),
		slug: String(item.fields.slug),
		coverImage,
		description: await parseMarkdown(String(item.fields.description)),
		role: item.fields.role ? String(item.fields.role) : null,
		videoLink: getLink(item.fields.videoLink),
		summary: String(item.fields.summary),
		projectType: item.fields.projectType as ProjectType[],
		password: item.fields.password ? String(item.fields.password) : null
	};
	return project;
}

export default async function getProjects(): Promise<Project[]> {
	const projectData = await client.getEntries({
		content_type: 'project',
		order: ['fields.order']
	});
	return Promise.all(projectData.items.map(formatProject));
}

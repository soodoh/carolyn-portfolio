import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import type { Project } from '$lib/types';
import type { PageServerLoad } from './$types';
import { client } from '$lib/utils/contentful';
import { formatProject } from '$lib/utils/getProjects';
import { imageRenderer } from '$lib/utils/markdownRenderer';

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

export const load: PageServerLoad<{ project: Project }> = async ({ params }) => {
	const projectData = await client.getEntries({
		content_type: 'project',
		'fields.slug': params.slug
	});
	if (projectData.items.length === 0) {
		throw error(404, 'Not found');
	}

	marked.use({
		mangle: false,
		headerIds: false,
		renderer: {
			image: imageRenderer
		}
	});
	const project = formatProject(projectData.items[0]);
	const descriptionString = String(project.description);
	const parsedDescription = marked.parse(descriptionString);
	project.description = parsedDescription;
	project.videoLink = getLink(project.videoLink);

	return { project };
};

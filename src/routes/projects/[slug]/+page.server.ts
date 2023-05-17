import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import type { Project, ProjectType } from '$lib/types';
import type { PageServerLoad } from './$types';
import type { Asset as ContentfulAsset } from 'contentful';
import { client, formatAsset } from '$lib/utils/contentful';
import { imageRenderer } from '$lib/utils/markdownRenderer';

export const load: PageServerLoad<{ project: Project }> = async ({ params }) => {
	const projectData = await client.getEntries({
		content_type: 'project',
		'fields.slug': params.slug
	});
	if (projectData.items.length === 0) {
		throw error(404, 'Not found');
	}

	marked.use({
		renderer: {
			image: imageRenderer
		}
	});
	const descriptionString = String(projectData.items[0].fields.description);
	const parsedDescription = marked.parse(descriptionString);

	const project = {
		id: String(projectData.items[0].sys.id),
		slug: String(projectData.items[0].fields.slug),
		coverImage: formatAsset(projectData.items[0].fields.coverImage as ContentfulAsset),
		title: String(projectData.items[0].fields.title),
		description: parsedDescription,
		role: String(projectData.items[0].fields.role),
		link: projectData.items[0].fields.link ? String(projectData.items[0].fields.link) : null,
		summary: String(projectData.items[0].fields.summary),
		projectType: projectData.items[0].fields.projectType as ProjectType[]
	};
	return { project };
};

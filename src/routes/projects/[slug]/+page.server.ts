import type { Project, ProjectType } from '$lib/types';
import type { PageServerLoad } from './$types';
import type { Asset as ContentfulAsset } from 'contentful';
import { client, formatAsset } from '$lib/utils/contentful';

export const load: PageServerLoad<{ project: Project }> = async ({ params }) => {
	const projectData = await client.getEntries({
		content_type: 'project',
		'fields.slug': params.slug
	});
	const project = {
		id: String(projectData.items[0].sys.id),
		slug: String(projectData.items[0].fields.slug),
		coverImage: formatAsset(projectData.items[0].fields.coverImage as ContentfulAsset),
		title: String(projectData.items[0].fields.title),
		description: String(projectData.items[0].fields.description),
		role: String(projectData.items[0].fields.role),
		link: String(projectData.items[0].fields.link),
		summary: String(projectData.items[0].fields.summary),
		projectType: projectData.items[0].fields.projectType as ProjectType[]
	};
	return { project };
};

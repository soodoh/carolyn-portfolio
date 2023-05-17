import type { Project, ProjectType } from '$lib/types';
import type { Asset as ContentfulAsset } from 'contentful';
import { client, formatAsset } from '$lib/utils/contentful';

export default async function getProjects(): Promise<Project[]> {
	const projectData = await client.getEntries({
		content_type: 'project',
		order: ['fields.order']
	});
	return projectData.items.map((item) => ({
		id: String(item.sys.id),
		title: String(item.fields.title),
		slug: String(item.fields.slug),
		coverImage: formatAsset(item.fields.coverImage as ContentfulAsset),
		description: String(item.fields.description),
		role: String(item.fields.role),
		link: item.fields.link ? String(item.fields.link) : null,
		summary: String(item.fields.summary),
		projectType: item.fields.projectType as ProjectType[]
	}));
}

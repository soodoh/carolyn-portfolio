import type { Project, ProjectType } from '$lib/types';
import type { Asset as ContentfulAsset, Entry } from 'contentful';
import { client, formatAsset } from '$lib/utils/contentful';

export async function formatProject(item: Entry) {
	const coverImage = await formatAsset(item.fields.coverImage as ContentfulAsset);
	const project: Project = {
		id: String(item.sys.id),
		title: String(item.fields.title),
		slug: String(item.fields.slug),
		coverImage,
		description: String(item.fields.description),
		role: item.fields.role ? String(item.fields.role) : null,
		videoLink: item.fields.videoLink ? String(item.fields.videoLink) : null,
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

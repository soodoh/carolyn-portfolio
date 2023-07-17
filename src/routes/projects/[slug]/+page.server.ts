import { error } from '@sveltejs/kit';
import type { Project } from '$lib/types';
import type { PageServerLoad } from './$types';
import { client } from '$lib/server/contentful';
import { formatProject } from '$lib/server/getProjects';

export const load: PageServerLoad<{ project: Project }> = async ({ params }) => {
	const projectData = await client.getEntries({
		content_type: 'project',
		'fields.slug': params.slug
	});
	if (projectData.items.length === 0) {
		throw error(404, 'Not found');
	}

	const project = await formatProject(projectData.items[0]);
	return { project };
};

import getProjects from '$lib/server/getProjects';

export async function load() {
	const projects = await getProjects();
	return { projects };
}

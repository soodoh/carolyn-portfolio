import getProjects from '$lib/getProjects';

export async function load() {
	const projects = await getProjects();
	return { projects };
}

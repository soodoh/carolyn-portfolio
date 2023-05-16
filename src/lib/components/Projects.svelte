<script lang="ts">
	import type { ProjectType, Project } from '$lib/types';
	import Filter from './Filter.svelte';
	import Image from './Image.svelte';
	import Modal from './Modal.svelte';
	import Masonry from 'svelte-bricks';

	export let projects: Project[];

	const projectTypes: ProjectType[] = Array.from(
		new Set(
			projects.reduce(
				(typeList, project) => {
					return typeList.concat(project.projectType);
				},
				['All'] as ProjectType[]
			)
		)
	);
	let currentProjectType: ProjectType = 'All';
	let currentProjects = projects;

	function handleProjectChange(projectType: string) {
		currentProjectType = projectType as ProjectType;
		if (projectType === 'All') {
			currentProjects = projects;
		} else {
			currentProjects = projects.filter((project) =>
				project.projectType.includes(currentProjectType)
			);
		}
	}
</script>

<div class="container">
	<Filter options={projectTypes} current={currentProjectType} onChange={handleProjectChange} />

	<Masonry items={currentProjects} minColWidth={250} maxColWidth={500} gap={50} let:item>
		<Image
			image={item.coverImage}
			srcset={[414, 728, 1440]}
			sizes="(max-width: 414px) 100vw, (max-width: 728px) 75vw, 25vw"
		/>
	</Masonry>
</div>

<style>
	.container {
		margin: auto;
		max-width: 1440px;
		padding: 0 var(--padding);
	}
</style>

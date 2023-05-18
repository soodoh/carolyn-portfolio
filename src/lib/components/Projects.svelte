<script lang="ts">
	import type { ProjectType, Project } from '$lib/types';
	import Filter from './Filter.svelte';
	import Image from './Image.svelte';
	import Masonry from 'svelte-bricks';
	import LayoutContainer from '$lib/components/LayoutContainer.svelte';

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

<LayoutContainer>
	<Filter options={projectTypes} current={currentProjectType} onChange={handleProjectChange} />

	<Masonry items={currentProjects} minColWidth={250} maxColWidth={500} gap={50} let:item>
		<a
			aria-label={`${item.title} - ${item.summary}`}
			href={`/projects/${item.slug}`}
			class="project-container"
		>
			<div class="project-info">
				<h2>{item.title}</h2>
				<h3>{item.summary}</h3>
			</div>
			<Image
				image={item.coverImage}
				srcset={[100, 200, 300, 480]}
				sizes="(max-width: 414px) 100vw, (max-width: 728px) 75vw, 25vw"
			/>
		</a>
	</Masonry>
</LayoutContainer>

<style>
	.project-container {
		position: relative;
		display: flex;
		color: var(--dark-text);
		text-decoration: none;
	}
	.project-info h2,
	.project-info h3 {
		margin: 0;
		padding: 0;
		display: inline;
		text-align: center;
		font-family: var(--body-font);
	}
	.project-info h2 {
		font-size: 1.8rem;
		margin-bottom: 0.5rem;
	}
	.project-info h3 {
		font-size: 1rem;
	}
	.project-info {
		transition: all 250ms ease-in-out;
		visibility: hidden;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.project-container:hover .project-info {
		transition: all 250ms ease-in-out;
		visibility: visible;
		background-color: rgba(255, 255, 255, 0.9);
	}
</style>

<script lang="ts">
	import type { Asset, Project } from '$lib/types';
	import Background from '$lib/Background.svelte';
	import Projects from '$lib/Projects.svelte';

	export let data: {
		backgroundImage: Asset;
		projects: Project[];
	};
</script>

<div class="container">
	<Background image={data.backgroundImage} />
	<div class="brand">
		<svg inline-src="logo" />
		<h1>Carolyn DiLoreto</h1>
	</div>
	<div class="links">
		<a href="/photography">View Photography</a>
		<a href="/projects">View Projects</a>
	</div>
</div>
<Projects projects={data.projects} />

<style>
	.container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.brand {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.brand svg {
		height: 8rem;
		margin-bottom: 2rem;
	}
	.brand h1 {
		font-size: 3.5rem;
		color: var(--light-text);
		margin: 0;
	}
	.links {
		display: flex;
		justify-content: space-between;
		margin-top: 2rem;
		width: 28rem;
	}
	.links a {
		display: flex;
		justify-content: center;
		font-size: 1rem;
		color: var(--light-color);
		text-decoration: none;
		border: 1px solid var(--light-color);
		padding: 0.5rem;
		width: 10rem;
		transition: background-color 0.2s ease-in-out;
	}
	.links a:hover {
		background-color: var(--light-color);
		color: black;
		transition: background-color 0.2s ease-in-out;
	}
	@media (max-width: 820px) {
		.brand svg {
			height: 6rem;
		}
		.brand h1 {
			font-size: 2rem;
		}
		.links {
			flex-direction: column;
			align-items: center;
		}
		.links a {
			margin-bottom: 1rem;
		}
	}
</style>

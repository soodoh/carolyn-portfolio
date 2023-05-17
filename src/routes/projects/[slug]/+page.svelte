<script lang="ts">
	import Markdown from 'svelte-markdown';
	import Image from '$lib/components/Image.svelte';

	export let data;
</script>

<div class="container">
	<a href="/projects" class="go-back">
		<svg inline-src="left-arrow" />
		Go Back
	</a>
	<section class="header">
		<div class="info">
			<h1>{data.project.title}</h1>
			<h2>{data.project.role}</h2>
		</div>
		<div class="image">
			<Image
				image={data.project.coverImage}
				sizes="(max-width: 950px) 100vw, 450px"
				srcset={[414, 728, 1440]}
			/>
		</div>
	</section>
	<div id="markdown-container">
		<Markdown source={data.project.description} />
	</div>
	<a href="/projects" class="view-more"> View More Work </a>
</div>

<style>
	.container {
		padding: 2rem var(--padding);
		max-width: 1000px;
		margin: auto;
	}
	.go-back {
		transition: all 250ms ease-in-out;
		background-color: transparent;
		border: 1px solid var(--dark-color);
		color: var(--dark-color);
		display: inline-flex;
		align-items: center;
		text-decoration: none;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		margin-bottom: 2rem;
	}
	.go-back:hover {
		background-color: var(--dark-transparent-color);
		border: 1px solid var(--dark-transparent-color);
		transition: all 250ms ease-in-out;
	}
	.go-back svg {
		width: 1.5rem;
		fill: var(--dark-color);
	}
	.view-more {
		background-color: var(--dark-color);
		color: var(--light-color);
		text-decoration: none;
		margin: auto;
		display: inline;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
	}
	.header {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.image {
		width: 100%;
	}
	.info h1 {
		font-size: 3.8rem;
		margin-bottom: 0.5rem;
	}
	.info h2 {
		font-family: var(--body-font);
	}
</style>

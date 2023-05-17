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
	<div class="markdown-container">
		{@html data.project.description}
	</div>
	<a href="/projects" class="view-more">View More Work</a>
</div>

<style>
	.container {
		padding: 2rem var(--padding);
		max-width: 1000px;
		margin: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.go-back {
		align-self: flex-start;
		transition: all 250ms ease-in-out;
		background-color: transparent;
		border: 1px solid rgba(var(--dark-color-rgb), 0.5);
		color: var(--dark-color);
		display: inline-flex;
		align-items: center;
		text-decoration: none;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		margin-bottom: 2rem;
	}
	.go-back:hover {
		background-color: rgba(var(--dark-color-rgb), 0.1);
		border: 1px solid rgba(var(--dark-color-rgb), 1);
		transition: all 250ms ease-in-out;
	}
	.go-back svg {
		width: 1.5rem;
		fill: var(--dark-color);
	}
	.view-more {
		background-color: var(--dark-color);
		color: var(--light-text);
		text-decoration: none;
		margin: auto;
		display: inline;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		transition: all 250ms ease-in-out;
	}
	.view-more:hover {
		transition: all 250ms ease-in-out;
		box-shadow: 0 .2rem .3rem var(--dark-color);
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
		margin-bottom: 0.3rem;
	}
	.info h2 {
		font-family: var(--body-font);
	}
	@media (max-width: 950px) {
		.header {
			grid-template-columns: 1fr;
		}
		.image {
			grid-row-start: 1;
		}
	}

	.markdown-container {
		margin: 5rem 3rem;
	}
	.markdown-container :global(h1) {
		text-align: center;
		font-size: 2.25rem;
	}
	.markdown-container :global(p) {
		text-indent: 2rem;
		text-align: left;
		line-height: 2rem;
		font-size: 1.25rem;
		font-family: var(--body-font);
		margin-bottom: 2rem;
	}
	.markdown-container :global(img) {
		margin-left: -2rem;
		width: 100%;
	}
</style>

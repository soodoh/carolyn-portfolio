<script lang="ts">
	import Background from '$lib/components/Background.svelte';
	import Projects from '$lib/components/Projects.svelte';
	import { onMount } from 'svelte';
	import { transparentHeader } from '$lib/stores';

	export let data;
	let homePage: HTMLElement;
	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const isIntersecting = entries[0].isIntersecting;
				transparentHeader.update(() => isIntersecting);
			},
			{ rootMargin: `-${document.querySelector('header')?.clientHeight ?? 64}px`, threshold: 0 }
		);
		observer.observe(homePage);
	});
</script>

<svelte:head>
	<title>CD Portfolio</title>
</svelte:head>
<Background image={data.backgroundImage} />
<div class="container" bind:this={homePage}>
	<div class="brand">
		<svg inline-src="logo" />
		<h1>Carolyn DiLoreto</h1>
	</div>
	<div class="links">
		<a aria-label="View Photography" href="/photography">View Photography</a>
		<a aria-label="View Projects" href="/projects">View Projects</a>
	</div>
</div>
<Projects projects={data.projects} />

<style>
	.container {
		height: calc(100vh - var(--header-height));
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

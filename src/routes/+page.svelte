<script lang="ts">
	import { onMount } from 'svelte';
	import Background from '$lib/components/Background.svelte';
	import Projects from '$lib/components/Projects.svelte';
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
	<meta
		name="description"
		content="Carolyn DiLoreto is a multi-media visual artist, dancer and USC alumnus. In this portfolio, view photo galleries, read about past projects, or even read her bio."
	/>
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

<style lang="postcss">
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		height: 100vh;
	}
	.brand {
		display: flex;
		flex-direction: column;
		align-items: center;

		& svg {
			height: 8rem;
			margin-bottom: 2rem;
			@media (--md-viewport) {
				& {
					height: 6rem;
				}
			}
		}
		& h1 {
			font-size: 3.5rem;
			color: var(--light-text);
			margin: 0;
			@media (--md-viewport) {
				& {
					font-size: 2rem;
				}
			}
		}
	}
	.links {
		display: flex;
		justify-content: space-between;
		margin-top: 2rem;
		width: 28rem;
		@media (--md-viewport) {
			& {
				flex-direction: column;
				align-items: center;
				width: auto;
			}
		}

		& a {
			display: flex;
			justify-content: center;
			font-size: 1rem;
			color: var(--light-color);
			text-decoration: none;
			border: 1px solid var(--light-color);
			padding: 0.5rem;
			width: 10rem;
			transition: background-color 0.2s ease-in-out;
			@media (--md-viewport) {
				& {
					margin-bottom: 1rem;
				}
			}

			&:hover {
				background-color: var(--light-color);
				color: black;
				transition: background-color 0.2s ease-in-out;
			}
		}
	}
</style>

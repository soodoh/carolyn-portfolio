<script lang="ts">
	import { afterUpdate, onMount } from 'svelte';
	import type { ImageType } from '$lib/types';
	import { imageFormats } from '$lib/constants';

	export let srcset: number[];
	export let sizes: string;
	export let image: ImageType;

	let imageElement: HTMLImageElement;
	let inViewport = false;

	let loading = true;
	let onLoad = (_event: Event) => {
		loading = false;
	};

	afterUpdate(() => {
		if (!imageElement.complete) {
			loading = true;
		}
	});

	onMount(() => {
		const rect = imageElement.getBoundingClientRect();
		inViewport = rect.top <= window.innerHeight && rect.bottom >= 0;
	});
</script>

{#if loading}
	<img src={image.placeholder} alt="Blur placeholder" />
{/if}
<picture>
	{#each imageFormats as format}
		<source
			type={`image/${format}`}
			srcset={srcset.map((size) => `${image.url}?w=${size}&fm=${format} ${size}w`).join(', ')}
			{sizes}
		/>
	{/each}
	<img
		class:loading
		bind:this={imageElement}
		on:load={onLoad}
		src={`${image.url}?fm=jpg&w=${srcset[0]}`}
		alt={image.title}
		loading={!inViewport ? 'lazy' : 'eager'}
	/>
</picture>

<style lang="postcss">
	.loading {
		display: none;
	}
</style>

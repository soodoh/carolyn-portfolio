<script lang="ts">
	import type { Asset } from '$lib/types';
	import { onMount } from 'svelte';

	export let srcset: number[];
	export let sizes: string;
	export let image: Asset;
	const formats = ['avif', 'webp', 'jpg'];
	let imageElement: HTMLElement;
	let inViewport = false;

	onMount(() => {
		const rect = imageElement.getBoundingClientRect();
		inViewport = rect.top < window.innerHeight && rect.bottom >= 0;
	});
</script>

<picture>
	{#each formats as format}
		<source
			type={`image/${format}`}
			srcset={srcset.map((size) => `${image.url}?w=${size}&fm=${format} ${size}w`).join(', ')}
			{sizes}
		/>
	{/each}
	<img
		loading={!inViewport ? 'lazy' : null}
		src={`${image.url}?fm=jpg&w=${srcset[0]}`}
		alt={image.title}
		bind:this={imageElement}
	/>
</picture>

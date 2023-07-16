<script lang="ts">
	import { onMount } from 'svelte';
	import type { ImageType } from '$lib/types';

	export let srcset: number[];
	export let sizes: string;
	export let image: ImageType;
	// const formats = ['avif', 'webp', 'jpg', 'gif'];
	const formats = ['webp', 'jpg', 'gif'];
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
		src={image.placeholder || `${image.url}?fm=jpg&w=${srcset[0]}`}
		alt={image.title}
		bind:this={imageElement}
	/>
</picture>

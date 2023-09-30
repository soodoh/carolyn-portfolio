<script lang="ts">
	import Image from '$lib/components/Image.svelte';
	import type { ImageType } from '$lib/types';
	import { imageFormats } from '$lib/constants';

	export let srcset: number[];
	export let sizes: string;
	export let image: ImageType;
	export let useSSR = false;

	let paddingBottom = `${(image.height / image.width) * 100}%`;
</script>

<div
	class="responsive-image"
	style:padding-bottom={paddingBottom}
	style:background-image={useSSR ? `url(${image.placeholder})` : null}
>
	{#if useSSR}
		<picture>
			{#each imageFormats as format}
				<source
					type={`image/${format}`}
					srcset={srcset.map((size) => `${image.url}?w=${size}&fm=${format} ${size}w`).join(', ')}
					{sizes}
				/>
			{/each}
			<img src={`${image.url}?fm=jpg&w=${srcset[0]}`} alt={image.title} loading="lazy" />
		</picture>
	{:else}
		<Image {srcset} {sizes} {image} />
	{/if}
</div>

<style lang="postcss">
	.responsive-image {
		position: relative;
		width: 100%;
		height: 0;
		background-size: 100%;
	}
	.responsive-image :global(img) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>

<script lang="ts">
	import type { Asset } from '$lib/types';

	export let srcset: number[];
	export let sizes: string;
	export let image: Asset;
	const formats = ['avif', 'webp', 'jpg'];
</script>

<picture>
	{#each formats as format}
		<source
			type={`image/${format}`}
			srcset={srcset.map((size) => `${image.url}?w=${size}&fm=${format} ${size}w`).join(', ')}
			{sizes}
		/>
	{/each}
	<img class={$$restProps.class || ''} src={`${image.url}?fm=jpg&w=${srcset[0]}`} alt={image.title} />
</picture>

<style>
	img,
	picture {
		width: 100%;
		height: auto;
		padding: 0;
		margin: 0;
	}
</style>

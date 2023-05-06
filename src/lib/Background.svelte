<script lang="ts">
	import type { Asset } from '$lib/types';

	export let image: Asset;
	const sizes = [480, 768, 1024, 1366, 1600, 1920];
	const formats = ['avif', 'webp', 'jpg'];
	const srcsets = formats.map((format) => ({
		format: `image/${format}`,
		srcset: sizes.map((size) => `${image.url}?fm=${format}&w=${size} ${size}w`).join(', ')
	}));
</script>

<div class="container">
	<picture>
		{#each srcsets as { format, srcset }}
			<source type={format} {srcset} sizes="100vw" />
		{/each}
		<img src={`${image.url}?fm=jpg&w=${sizes[0]}`} alt={image.title} />
	</picture>
</div>

<style>
	.container {
		background-color: var(--dark-color);
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: -1;
	}
	.container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>

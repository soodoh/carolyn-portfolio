<script lang="ts">
	import type { Asset } from '$lib/types';
	import Image from './Image.svelte';

	export let fixed = false;
	export let image: Asset;
	const srcset = [480, 768, 1024, 1366, 1600, 1920];
	const formats = ['avif', 'webp', 'jpg'];
</script>

<div class="container" class:fixed>
	<Image {image} sizes="100vw" {srcset} />
</div>

<style>
	.container {
		background-color: var(--dark-color);
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: -1;
	}
	.fixed {
		position: fixed;
	}
	.container :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>

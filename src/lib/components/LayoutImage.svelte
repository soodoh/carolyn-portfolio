<script lang="ts">
	import type { Asset } from '$lib/types';
	import Image from '$lib/components/Image.svelte';

	export let srcset: number[];
	export let sizes: string;
	export let image: Asset;
	let paddingBottom = `${(image.height / image.width) * 100}%`;
</script>

<div class="responsive-image" style:padding-bottom={paddingBottom}>
	<Image {srcset} {sizes} {image} />
</div>

<style>
	.responsive-image {
		position: relative;
		width: 100%;
		height: 0;
	}
	.responsive-image :global(img) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>

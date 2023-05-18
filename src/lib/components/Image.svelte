<script lang="ts">
	import type { Asset } from '$lib/types';

	export let srcset: number[];
	export let sizes: string;
	export let image: Asset;
	export let layoutShift = true;
	const formats = ['avif', 'webp', 'jpg'];
	let paddingBottom = `${(image.height / image.width) * 100}%`;
</script>

{#if layoutShift}
	<div class="responsive-image" style:padding-bottom={paddingBottom}>
		<picture>
			{#each formats as format}
				<source
					type={`image/${format}`}
					srcset={srcset.map((size) => `${image.url}?w=${size}&fm=${format} ${size}w`).join(', ')}
					{sizes}
				/>
			{/each}
			<img loading="lazy" src={`${image.url}?fm=jpg&w=${srcset[0]}`} alt={image.title} />
		</picture>
	</div>
{:else}
	<picture>
		{#each formats as format}
			<source
				type={`image/${format}`}
				srcset={srcset.map((size) => `${image.url}?w=${size}&fm=${format} ${size}w`).join(', ')}
				{sizes}
			/>
		{/each}
		<img loading="lazy" src={`${image.url}?fm=jpg&w=${srcset[0]}`} alt={image.title} />
	</picture>
{/if}

<style>
	.responsive-image {
		position: relative;
		width: 100%;
		height: 0;
	}
	.responsive-image img {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>

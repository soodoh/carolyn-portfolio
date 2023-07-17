<script lang="ts">
	import Masonry from 'svelte-bricks';
	import type { ImageType } from '$lib/types';
	import Filter from '$lib/components/Filter.svelte';
	import LayoutContainer from '$lib/components/LayoutContainer.svelte';
	import Image from '$lib/components/LayoutImage.svelte';
	import ImageGallery from '$lib/components/ImageGallery.svelte';

	export let data;
	let currentAlbum = data.albums[0].name;
	const albumNames = data.albums.map((album) => album.name);
	let galleryImages = data.albums[0].photos;

	function handleAlbumChange(albumName: string) {
		currentAlbum = albumName;
		galleryImages = data.albums.find((album) => album.name === albumName)?.photos || [];
	}

	let currentPhotoIndex = 0;
	let galleryOpen = false;

	function handleThumbnailClick(image: ImageType) {
		currentPhotoIndex = galleryImages.findIndex((cur) => cur === image);
		galleryOpen = true;
	}
</script>

<svelte:head>
	<title>CD Photography</title>
	<meta
		name="description"
		content="Carolyn DiLoreto's photography portfolio consists of dance, scenery and headshots. She is available for hire as a professional photographer in Los Angeles, CA."
	/>
</svelte:head>
<LayoutContainer>
	<Filter options={albumNames} current={currentAlbum} onChange={handleAlbumChange} />

	<ImageGallery
		open={galleryOpen}
		bind:current={currentPhotoIndex}
		images={galleryImages}
		onClose={() => (galleryOpen = false)}
	/>

	<Masonry items={galleryImages} minColWidth={250} maxColWidth={500} gap={50} let:item>
		<button aria-label="View fullscreen photo" on:click={() => handleThumbnailClick(item)}>
			<Image
				image={item}
				srcset={[100, 200, 300, 480]}
				sizes="(max-width: 414px) 100vw, (max-width: 728px) 75vw, 25vw"
			/>
		</button>
	</Masonry>
</LayoutContainer>

<style lang="postcss">
	button {
		border: none;
		background-color: transparent;
		width: 100%;
		cursor: pointer;
	}
</style>

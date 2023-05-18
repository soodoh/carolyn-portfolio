<script lang="ts">
	import type { Asset } from '$lib/types';
	import Filter from '$lib/components/Filter.svelte';
	import Image from '$lib/components/Image.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Masonry from 'svelte-bricks';
	import LayoutContainer from '$lib/components/LayoutContainer.svelte';

	export let data;
	let currentAlbum = data.albums[0].name;
	let photos = data.albums[0].photos;
	const albumNames = data.albums.map((album) => album.name);

	function handleAlbumChange(albumName: string) {
		currentAlbum = albumName;
		photos = data.albums.find((album) => album.name === albumName)?.photos || [];
	}

	let photoIndex = 0;
	let currentPhoto = photos[0];
	let isOpen = false;

	function handlePhoto(image: Asset) {
		photoIndex = photos.findIndex((cur) => cur === image);
		currentPhoto = image;
		isOpen = true;
	}

	function handleKeypress(event: KeyboardEvent) {
		if (event.key == 'ArrowLeft' && photoIndex > 0) {
			handlePhoto(photos[photoIndex - 1]);
		}
		if (event.key == 'ArrowRight' && photoIndex <= photos.length - 2) {
			handlePhoto(photos[photoIndex + 1]);
		}
	}
</script>

<svelte:head>
	<title>CD Photography</title>
</svelte:head>
<LayoutContainer>
	<Filter options={albumNames} current={currentAlbum} onChange={handleAlbumChange} />

	<Modal bind:isOpen onKeypress={handleKeypress}>
		<div class="modal-container">
			<div class="close">
				<button aria-label="Close image modal" on:click={() => (isOpen = false)}>&times;</button>
			</div>
			<div class="prev">
				{#if photoIndex > 0}
					<button aria-label="Previous photo" on:click={() => handlePhoto(photos[photoIndex - 1])}
						><svg inline-src="left-chevron" /></button
					>
				{/if}
			</div>

			<Image layoutShift={false} image={currentPhoto} srcset={[500, 725, 1440]} sizes="100vw" />

			<div class="next">
				{#if photoIndex <= photos.length - 2}
					<button aria-label="Next photo" on:click={() => handlePhoto(photos[photoIndex + 1])}>
						<svg inline-src="right-chevron" />
					</button>
				{/if}
			</div>
			<div class="info">
				{photoIndex + 1} / {photos.length}
			</div>
		</div>
	</Modal>

	<Masonry items={photos} minColWidth={250} maxColWidth={500} gap={50} let:item>
		<button aria-label="View fullscreen photo" on:click={() => handlePhoto(item)}>
			<Image
				image={item}
				srcset={[100, 200, 300, 480]}
				sizes="(max-width: 414px) 100vw, (max-width: 728px) 75vw, 25vw"
			/>
		</button>
	</Masonry>
</LayoutContainer>

<style>
	button {
		border: none;
		background-color: transparent;
		width: 100%;
		cursor: pointer;
	}
	.modal-container :global(img) {
		width: 100%;
		height: 100%;
		max-width: calc(100vw - 5rem);
		max-height: calc(100vh - 5rem);
	}
	.modal-container {
		display: grid;
		height: 100vh;
		width: 100vw;
		grid-template-rows: 1fr auto 1fr;
		grid-template-columns: 1fr auto 1fr;
		justify-items: center;
		align-items: center;
		color: var(--light-color);
	}
	.modal-container button {
		font-size: 2rem;
		color: var(--light-color);
	}
	.modal-container svg {
		width: 2rem;
		height: 2rem;
		stroke: var(--light-color);
	}
	.close {
		grid-column: 1/4;
		justify-self: flex-end;
		align-self: flex-start;
	}
	.prev {
		justify-self: flex-start;
	}
	.next {
		justify-self: flex-end;
	}
	.info {
		grid-column: 1/4;
		justify-self: center;
	}
</style>

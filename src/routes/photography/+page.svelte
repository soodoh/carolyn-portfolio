<script lang="ts">
	import type { Asset, Album } from '$lib/types';
	import Filter from '$lib/Filter.svelte';
	import Image from '$lib/Image.svelte';
	import Modal from '$lib/Modal.svelte';
	import Masonry from 'svelte-bricks';

	export let data: { albums: Album[] };
	let currentAlbum = 'All';
	const allPhotos = data.albums.flatMap((album) => album.photos);
	let photos = allPhotos;
	const albumNames = ['All', ...data.albums.map((album) => album.name)];

	function handleAlbumChange(albumName: string) {
		currentAlbum = albumName;
		if (currentAlbum === 'All') {
			photos = allPhotos;
		} else {
			photos = data.albums.find((album) => album.name === albumName)?.photos || [];
		}
	}

	let currentPhoto = allPhotos[0];
	let isOpen = false;
	function handlePhoto(image: Asset) {
		currentPhoto = image;
		isOpen = true;
	}
</script>

<div class="container">
	<Filter options={albumNames} current={currentAlbum} onChange={handleAlbumChange} />

	<Modal bind:isOpen>
		<!-- <div class="modal-container"> -->
		<!-- 	<div class="full-row">close</div> -->
		<!-- <div>prev</div> -->
		<div class="modal-image">
			<Image image={currentPhoto} srcset={[725, 1440]} sizes="100vw" />
		</div>
		<!-- <div>next</div> -->
		<!-- 	<div class="full-row">info</div> -->
		<!-- </div> -->
	</Modal>

	<Masonry items={photos} minColWidth={250} maxColWidth={500} gap={50} let:item>
		<button on:click={() => handlePhoto(item)}>
			<Image
				image={item}
				srcset={[414, 728, 1440]}
				sizes="(max-width: 414px) 100vw, (max-width: 728px) 75vw, 25vw"
			/>
		</button>
	</Masonry>
</div>

<style>
	.container {
		margin: auto;
		max-width: 1440px;
		padding: 0 var(--padding);
	}
	button {
		border: none;
		background-color: transparent;
		width: 100%;
		cursor: pointer;
	}
	.modal-image {
		max-width: 100%;
		max-height: 100%;
		position: relative;
	}
	:global(.modal-image img) {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.modal-container {
		width: 100%;
		display: grid;
		grid-template-rows: auto 1fr auto;
		grid-template-columns: auto 1fr auto;
	}
	.full-row {
		grid-column: 1 / 4;
	}
</style>

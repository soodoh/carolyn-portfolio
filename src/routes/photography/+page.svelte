<script lang="ts">
	import type { Album } from '$lib/types';
	import Filter from '$lib/Filter.svelte';
	import Image from '$lib/Image.svelte';
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
</script>

<div class="container">
	<Filter options={albumNames} current={currentAlbum} onChange={handleAlbumChange} />

	<Masonry items={photos} minColWidth={250} maxColWidth={500} gap={50} let:item>
		<button>
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
</style>

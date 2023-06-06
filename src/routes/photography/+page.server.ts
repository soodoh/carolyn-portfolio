import type { Album } from '$lib/types';
import type { PageServerLoad } from './$types';
import type { Asset as ContentfulAsset } from 'contentful';
import { client, formatAsset } from '$lib/utils/contentful';

export const load: PageServerLoad<{ albums: Album[] }> = async () => {
	const albumData = await client.getEntries({
	content_type: 'photos',
		order: ['fields.order']
	});
	const albums = await Promise.all(albumData.items.map(async (item) => {
	const photos = Array.isArray(item.fields.photos)
			? await Promise.all(item.fields.photos.map((photo) => formatAsset(photo as ContentfulAsset)))
			: [];
		return {
			name: String(item.fields.album),
			photos,
		};
	}));

	return { albums };
};

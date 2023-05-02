import contentful from 'contentful';
import type { Asset } from '$lib/types';
import type { Asset as ContentfulAsset } from 'contentful';

export const client = contentful.createClient({
	space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
	accessToken: import.meta.env.VITE_CONTENTFUL_DELIVERY_TOKEN
});

export function formatUrl(baseUrl: string) {
	return `https:${baseUrl}`;
}

export function formatAsset(asset: ContentfulAsset): Asset {
	return {
		id: asset.sys.id,
		title: String(asset.fields.title),
		url: formatUrl(String(asset.fields.file?.url))
	};
}

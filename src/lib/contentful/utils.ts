import contentful from 'contentful';
import type { Asset } from 'contentful';

export const client = contentful.createClient({
	space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
	accessToken: import.meta.env.VITE_CONTENTFUL_DELIVERY_TOKEN,
});

export function formatUrl(baseUrl: string) {
	return `https:${baseUrl}`;
}

export function formatAsset(asset: Asset) {
	return {
		id: asset.sys.id,
		title: asset.fields.title,
		url: formatUrl(asset.fields.file.url),
	};
}

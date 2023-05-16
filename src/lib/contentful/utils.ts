import contentful from 'contentful';
import type { Asset } from '$lib/types';
import type { Asset as ContentfulAsset } from 'contentful';
import { CONTENTFUL_ACCESS_TOKEN, CONTENTFUL_SPACE_ID } from '$env/static/private';

export const client = contentful.createClient({
	space: CONTENTFUL_SPACE_ID,
	accessToken: CONTENTFUL_ACCESS_TOKEN
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

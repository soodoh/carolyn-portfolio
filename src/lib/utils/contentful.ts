import contentful from 'contentful';
import type { Asset } from '$lib/types';
import type { AssetDetails, Asset as ContentfulAsset } from 'contentful';
import { CONTENTFUL_ACCESS_TOKEN, CONTENTFUL_SPACE_ID } from '$env/static/private';

export const client = contentful.createClient({
	space: CONTENTFUL_SPACE_ID,
	accessToken: CONTENTFUL_ACCESS_TOKEN
});

export function formatUrl(baseUrl: string) {
	return `https:${baseUrl}`;
}

export function formatAsset(asset: ContentfulAsset): Asset {
	const imageDetails = asset.fields.file?.details as AssetDetails;
	return {
		id: asset.sys.id,
		title: String(asset.fields.title),
		url: formatUrl(String(asset.fields.file?.url)),
		width: imageDetails.image?.width ?? 0,
		height: imageDetails.image?.height ?? 0
	};
}

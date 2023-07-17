import contentful from 'contentful';
import type { Asset, ImageType } from '$lib/types';
import type { AssetDetails, Asset as ContentfulAsset } from 'contentful';
import { CONTENTFUL_ACCESS_TOKEN, CONTENTFUL_SPACE_ID } from '$env/static/private';
import { getPlaceholder } from '$lib/utils/images';

export const client = contentful.createClient({
	space: CONTENTFUL_SPACE_ID,
	accessToken: CONTENTFUL_ACCESS_TOKEN
});

export function formatUrl(baseUrl: string) {
	return `https:${baseUrl}`;
}

export function formatAsset(asset: ContentfulAsset): Asset {
	const assetUrl = formatUrl(String(asset.fields.file?.url));
	return {
		id: asset.sys.id,
		title: String(asset.fields.title),
		url: assetUrl
	};
}

export async function formatImage(contentfulAsset: ContentfulAsset): Promise<ImageType> {
	const asset = formatAsset(contentfulAsset);
	const imageDetails = contentfulAsset.fields.file?.details as AssetDetails;
	const imageWidth = imageDetails.image?.width ?? 0;
	const imageHeight = imageDetails.image?.height ?? 0;
	const placeholder = await getPlaceholder(`${asset.url}?w=100&fm=jpg`);

	return {
		...asset,
		width: imageWidth,
		height: imageHeight,
		placeholder
	};
}

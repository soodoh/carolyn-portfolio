import contentful from 'contentful';
import type { Asset } from '$lib/types';
import type { AssetDetails, Asset as ContentfulAsset } from 'contentful';
import { CONTENTFUL_ACCESS_TOKEN, CONTENTFUL_SPACE_ID } from '$env/static/private';
import { encodeImageToBlurhash } from '$lib/utils/images';

export const client = contentful.createClient({
	space: CONTENTFUL_SPACE_ID,
	accessToken: CONTENTFUL_ACCESS_TOKEN
});

export function formatUrl(baseUrl: string) {
	return `https:${baseUrl}`;
}

export async function formatAsset(asset: ContentfulAsset, useBlur = true): Promise<Asset> {
	const imageDetails = asset.fields.file?.details as AssetDetails;
	const imageUrl = formatUrl(String(asset.fields.file?.url));
	const imageWidth = imageDetails.image?.width ?? 0;
	const imageHeight = imageDetails.image?.height ?? 0;
	const blurHash = useBlur ? await encodeImageToBlurhash(`${imageUrl}?w=100`) : null;

	return {
		id: asset.sys.id,
		title: String(asset.fields.title),
		blurHash,
		url: imageUrl,
		width: imageWidth,
		height: imageHeight
	};
}

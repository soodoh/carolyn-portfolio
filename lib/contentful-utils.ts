import { getPlaceholder } from "@/lib/image-utils";
import {
  type AssetDetails,
  type Asset as ContentfulAsset,
  createClient,
} from "contentful";
import type { Asset, ImageType } from "@/lib/types";

export const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN as string,
});

export function formatUrl(baseUrl: string) {
  return `https:${baseUrl}`;
}

export function formatAsset(asset: ContentfulAsset): Asset {
  const assetUrl = formatUrl(String(asset.fields.file?.url));
  return {
    id: asset.sys.id,
    title: String(asset.fields.title),
    description: String(asset.fields.description),
    url: assetUrl,
  };
}

export async function formatImage(
  contentfulAsset: ContentfulAsset,
): Promise<ImageType> {
  const asset = formatAsset(contentfulAsset);
  const imageDetails = contentfulAsset.fields.file?.details as AssetDetails;
  const width = imageDetails.image?.width ?? 0;
  const height = imageDetails.image?.height ?? 0;
  const placeholder = await getPlaceholder(asset);

  return {
    ...asset,
    width,
    height,
    placeholder,
  };
}

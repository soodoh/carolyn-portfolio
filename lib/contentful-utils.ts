import { getPlaceholder, readImage } from "@/lib/image-utils";
import { createClient } from "contentful";
import type { AssetDetails, Asset as ContentfulAsset } from "contentful";
import type { Asset, ImageType } from "@/lib/types";

export const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
});

export function formatUrl(baseUrl: string): string {
  return `https:${baseUrl}`;
}

export function formatAsset(asset: ContentfulAsset): Asset {
  const fileUrl = asset.fields.file?.url;
  const assetUrl = formatUrl(typeof fileUrl === "string" ? fileUrl : "");
  const title = asset.fields.title;
  const description = asset.fields.description;
  return {
    id: asset.sys.id,
    title: typeof title === "string" ? title : "",
    description: typeof description === "string" ? description : "",
    url: assetUrl,
  };
}

const imageCache = new Map<string, ImageType>();

export async function formatImage(
  contentfulAsset: ContentfulAsset,
): Promise<ImageType> {
  const asset = formatAsset(contentfulAsset);
  const cached = imageCache.get(asset.id);
  if (cached) {
    return cached;
  }

  const imageDetails = contentfulAsset.fields.file?.details as AssetDetails;
  const width = imageDetails.image?.width ?? 0;
  const height = imageDetails.image?.height ?? 0;
  const placeholder = await getPlaceholder(asset.url);

  const image = {
    ...asset,
    width,
    height,
    placeholder,
  };
  imageCache.set(asset.id, image);

  return image;
}

export const getImageAssetFromRichTextNode = async (
  rawUrl: string,
  alt: string,
): Promise<ImageType> => {
  const url = formatUrl(rawUrl);
  const cached = imageCache.get(url);
  if (cached) {
    return cached;
  }

  const image = await readImage(url);
  const imageMetadata = await image.metadata();
  const placeholder = await getPlaceholder(url);

  return {
    id: url,
    title: alt,
    description: alt,
    url,
    placeholder,
    width: imageMetadata.width,
    height: imageMetadata.height,
  };
};

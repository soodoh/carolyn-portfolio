import { ContentfulClientApi, createClient } from "contentful";
import { getPlaiceholder } from "plaiceholder";
import type { Image } from "../types";

const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN as string;
let _client: ContentfulClientApi;

export function getClient() {
  if (!_client) {
    _client = createClient({
      space,
      accessToken,
    });
  }
  return _client;
}

export const formatUrl = (url?: string) => `https:${url}`;

export const formatImage = async (image: any): Promise<Image> => {
  const imageUrl = formatUrl(image?.fields?.file?.url);
  const blurDataUrl = (await getPlaiceholder(imageUrl)).base64;

  return {
    id: image?.sys?.id,
    url: imageUrl,
    title: image?.fields?.title,
    description: image?.fields?.description || "Alt text",
    width: image?.fields?.file?.details?.image?.width,
    height: image?.fields?.file?.details?.image?.height,
    blurDataUrl,
  };
};

import { Jimp, JimpMime, ResizeStrategy } from "jimp";
import type { Asset } from "./types";

type JimpType = Awaited<ReturnType<(typeof Jimp)["read"]>>;

const placeholderCache: Map<string, string> = new Map();

export async function readImage(asset: Asset): Promise<JimpType | null> {
  const url = `${asset.url}?w=100&q=50&fm=jpg`;
  const image = await Jimp.read(url);
  image.resize({ w: 25, mode: ResizeStrategy.BICUBIC });
  return image;
}

export const getPlaceholder = async (asset: Asset) => {
  const cached = placeholderCache.get(asset.id);
  if (cached) {
    return cached;
  }

  const image = await readImage(asset);
  if (!image) {
    throw new TypeError(`getPlaceholder: failed to read URL: ${asset.url}`);
  }

  const placeholder = await image.getBase64(JimpMime.gif);
  placeholderCache.set(asset.id, placeholder);

  return placeholder;
};

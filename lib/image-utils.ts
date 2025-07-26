import { Jimp, JimpMime } from "jimp";
import type { ImagePlaceholder } from "./types";

type JimpType = Awaited<ReturnType<(typeof Jimp)["read"]>>;

export async function readImage(baseUrl: string): Promise<JimpType> {
  // Reduces memory usage, since we just need this for blur hashes and (relative) image dimensions
  const url = `${baseUrl}?w=100&q=10&fm=jpg`;
  const image = await Jimp.read(url);
  if (!image) {
    throw new TypeError(`Failed to read image from URL: ${url}`);
  }

  return image;
}

export const getPlaceholder = async (
  url: string,
): Promise<ImagePlaceholder> => {
  const image = await readImage(url);
  image.resize({ w: 20 });
  image.blur(3);
  const placeholder = (await image.getBase64(JimpMime.gif)) as ImagePlaceholder;

  return placeholder;
};

import sharp from "sharp";
import type { ImagePlaceholder } from "./types";

export async function readImage(baseUrl: string): Promise<sharp.Sharp> {
  const url = `${baseUrl}?w=100&q=50&fm=jpg`;
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return sharp(arrayBuffer).jpeg();
}

export const getPlaceholder = async (
  url: string,
): Promise<ImagePlaceholder> => {
  const image = await readImage(url);
  const imageBuffer = await image.resize(25).blur().toBuffer();
  return `data:image/jpg;base64,${imageBuffer.toString("base64")}`;
};

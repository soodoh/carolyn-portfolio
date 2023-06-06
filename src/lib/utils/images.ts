import { encode } from 'blurhash';
import sharp from 'sharp';

async function getImageData(imageUrl: string) {
	const response = await fetch(imageUrl);
	const buffer = await response.arrayBuffer();
	return sharp(buffer).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
}

export async function encodeImageToBlurhash(url: string) {
	const image = await getImageData(url);
	return encode(image.data, image.info.width, image.info.height, 4, 4);
}

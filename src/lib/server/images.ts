import Jimp from 'jimp';
import { formatUrl } from './contentful';
import type { ImageType } from '$lib/types';

async function readImage(url: string): Promise<Jimp> {
	const response = await fetch(url);
	const arrayBuffer = await response.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	return new Promise((resolve, reject) => {
		Jimp.read(buffer, (err, image) => {
			if (err) {
				reject(err);
			}
			resolve(image);
		});
	});
}

export const getPlaceholder = async (url: string) => {
	const image = await readImage(`${url}?w=100&fm=jpg`);
	image.resize(25, Jimp.AUTO).quality(25).blur(5);
	const placeholder = await image.getBase64Async(image.getMIME());
	return placeholder;
};

export async function createImage(baseUrl: string, title: string): Promise<ImageType> {
	const url = formatUrl(baseUrl);
	const image = await readImage(`${url}?w=100&fm=jpg`);
	const placeholder = await getPlaceholder(url);
	return {
		id: url, // Probably unique enough
		title,
		url,
		width: image.getWidth(),
		height: image.getHeight(),
		placeholder
	};
}

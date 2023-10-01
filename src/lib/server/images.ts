import Jimp from 'jimp';
import { formatUrl } from './contentful';
import type { ImageType } from '$lib/types';

const imageCache: Map<string, Jimp> = new Map();

const maxRetries = 3;
async function fetchRetry(url: string, retries = maxRetries) {
	try {
		const response = await fetch(url);
		return response;
	} catch(_err) {
		retries--;
		console.log(`RETRYING FETCH #${maxRetries - retries} ${url.split('/').pop()}`);
		return fetchRetry(url, retries);
	}
}

export async function readImage(baseUrl: string): Promise<Jimp | null> {
	const cached = imageCache.get(baseUrl);
	if (cached) {
		console.log(`CACHED ${baseUrl.split('/').pop()}`);
		return cached;
	}
	const url = `${baseUrl}?w=100&q=50&fm=jpg`;
	const response = await fetchRetry(url);
	const arrayBuffer = await response.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	return new Promise((resolve, reject) => {
		Jimp.read(buffer, (err, image) => {
			if (err) {
				reject(err);
			}
			imageCache.set(baseUrl, image);
			resolve(image);
		});
	});
}

export const getPlaceholder = async (image: Jimp | null) => {
	if (!image) return '';
	image.resize(25, Jimp.AUTO).quality(25).blur(5);
	const placeholder = await image.getBase64Async(image.getMIME());
	return placeholder;
};

export async function createImage(baseUrl: string, title: string): Promise<ImageType> {
	const url = formatUrl(baseUrl);
	const image = await readImage(url);
	const placeholder = await getPlaceholder(image);
	return {
		id: url, // Probably unique enough
		title,
		url,
		width: image?.getWidth() || 100,
		height: image?.getHeight() || 100,
		placeholder,
	};
}

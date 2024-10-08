import { Jimp, JimpMime, ResizeStrategy } from 'jimp';
import { formatUrl } from './contentful';
import type { ImageType } from '$lib/types';

type JimpType = Awaited<ReturnType<(typeof Jimp)['read']>>;

const imageCache: Map<string, JimpType> = new Map();

export async function readImage(baseUrl: string): Promise<JimpType | null> {
	const cached = imageCache.get(baseUrl);
	if (cached) {
		console.log(`CACHED ${baseUrl.split('/').pop()}`);
		return Promise.resolve(cached);
	}
	const url = `${baseUrl}?w=100&q=50&fm=jpg`;
	return Jimp.read(url);
}

export const getPlaceholder = async (url: string) => {
	const image = await readImage(url);
	if (!image) {
		throw new TypeError(`getPlaceholder: failed to read URL: ${url}`);
	}
	image.resize({ w: 25, mode: ResizeStrategy.BICUBIC });
	const placeholder = await image.getBase64(JimpMime.gif);
	return placeholder;
};

// For SSR markdown for projects
export async function createImage(baseUrl: string, title: string): Promise<ImageType> {
	const url = formatUrl(baseUrl);
	const image = await readImage(url);
	const placeholder = await getPlaceholder(url);
	return {
		id: url, // Probably unique enough
		title,
		url,
		width: image?.width || 100,
		height: image?.height || 100,
		placeholder
	};
}

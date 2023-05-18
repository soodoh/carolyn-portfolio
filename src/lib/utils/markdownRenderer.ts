import type { Renderer } from 'marked';
import { formatUrl } from '$lib/utils/contentful';

function getSources(imageUrl: string, formats: string[], srcset: number[], sizes: string) {
	return formats.reduce((string, format) => {
		const imageSources = srcset
			.map((size) => `${imageUrl}?w=${size}&fm=${format} ${size}w`)
			.join(', ');
		return (
			string +
			`<source type="image/${format}"` +
			` srcset="${imageSources}"` +
			` sizes="${sizes}" />`
		);
	}, '');
}

export const imageRenderer: Renderer['image'] = (href: string, title) => {
	const imageUrl = formatUrl(href);
	const formats = ['avif', 'webp', 'jpg'];
	const srcset = [414, 700, 1000];
	const sizes = '100vw';
	return (
		`<picture>` +
		`${getSources(imageUrl, formats, srcset, sizes)}` +
		`<img src="${imageUrl}?fm=jpg&w=${srcset[0]}" alt="${title}" loading="lazy" />` +
		`</picture>`
	);
};

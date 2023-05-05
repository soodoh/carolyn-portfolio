import { formatAsset, client } from '$lib/contentful/utils';
import type { IconType } from '$lib/types';
import type { Asset as ContentfulAsset } from 'contentful';

export async function load() {
	const [socialMedia, aboutData] = await Promise.all([
		client.getEntries({ content_type: 'socialMedia' }),
		client.getEntries({ content_type: 'about' })
	]);
	const aboutEntry = aboutData.items[0];

	return {
		socialMedia: socialMedia.items.map((item) => ({
			id: item.sys.id,
			title: String(item.fields.title) as IconType,
			link: String(item.fields.link)
		})),
		backgroundImage: formatAsset(aboutEntry.fields.background as ContentfulAsset)
	};
}

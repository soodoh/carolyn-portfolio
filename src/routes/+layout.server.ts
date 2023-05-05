import type { IconType, LayoutData } from '$lib/types';
import type { Asset as ContentfulAsset } from 'contentful';
import { client, formatAsset } from '$lib/contentful/utils';

export async function load(): Promise<LayoutData> {
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

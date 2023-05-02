import { formatAsset, client } from '$lib/contentful/utils';
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
			title: String(item.fields.title),
			link: String(item.fields.link),
			icon: formatAsset(item.fields.icon as ContentfulAsset)
		})),
		backgroundImage: formatAsset(aboutEntry.fields.background as ContentfulAsset)
	};
}

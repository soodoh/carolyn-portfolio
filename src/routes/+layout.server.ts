import type { IconType } from '$lib/types';
import { client } from '$lib/contentful/utils';

export async function load() {
	const socialMedia = await client.getEntries({ content_type: 'socialMedia' });

	return {
		socialMedia: socialMedia.items.map((item) => ({
			id: item.sys.id,
			title: String(item.fields.title) as IconType,
			link: String(item.fields.link)
		}))
	};
}

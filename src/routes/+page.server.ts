import type { Asset as ContentfulAsset } from 'contentful';
import { client, formatAsset } from '$lib/contentful/utils';

export async function load() {
	const aboutData = await client.getEntries({ content_type: 'about' });
	const aboutEntry = aboutData.items[0];

	return {
		backgroundImage: formatAsset(aboutEntry.fields.background as ContentfulAsset)
	};
}

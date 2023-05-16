import type { Asset as ContentfulAsset } from 'contentful';
import { client, formatAsset } from '$lib/utils/contentful';

export async function load() {
	const aboutData = await client.getEntries({ content_type: 'about' });
	const aboutEntry = aboutData.items[0];

	return {
		profilePicture: formatAsset(aboutEntry.fields.profilePicture as ContentfulAsset),
		bio: String(aboutEntry.fields.bio),
		location: String(aboutEntry.fields.location),
		email: String(aboutEntry.fields.email)
	};
}

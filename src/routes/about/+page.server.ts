import { marked } from 'marked';
import type { Asset as ContentfulAsset } from 'contentful';
import { client, formatImage } from '$lib/server/contentful';

export async function load() {
	const aboutData = await client.getEntries({ content_type: 'about' });
	const aboutEntry = aboutData.items[0];
	const bioString = String(aboutEntry.fields.bio);
	marked.use({ mangle: false, headerIds: false });
	const parsedBio: string = marked.parse(bioString);
	const profilePicture = await formatImage(aboutEntry.fields.profilePicture as ContentfulAsset);

	return {
		profilePicture,
		parsedBio,
		location: String(aboutEntry.fields.location),
		email: String(aboutEntry.fields.email)
	};
}

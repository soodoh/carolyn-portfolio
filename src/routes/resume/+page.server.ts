import { redirect } from '@sveltejs/kit';
import type { Asset as ContentfulAsset } from 'contentful';
import { client, formatAsset } from '$lib/utils/contentful';

export async function load() {
	const aboutData = await client.getEntries({ content_type: 'about' });
	const aboutEntry = aboutData.items[0];
	const resume = await formatAsset(aboutEntry.fields.resume as ContentfulAsset, false);
	throw redirect(302, resume.url);
}

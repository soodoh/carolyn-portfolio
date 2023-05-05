import { redirect } from '@sveltejs/kit';
import type { Asset as ContentfulAsset } from 'contentful';
import { formatAsset, client } from '$lib/contentful/utils';

export async function load() {
	const aboutData = await client.getEntries({ content_type: 'about' });
	const aboutEntry = aboutData.items[0];
	const resume = formatAsset(aboutEntry.fields.resume as ContentfulAsset);
	throw redirect(302, resume.url);
}

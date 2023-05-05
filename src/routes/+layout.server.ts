import { formatAsset, client } from '$lib/contentful/utils';
import type { IconType, LayoutData } from '$lib/types';
import type { Asset as ContentfulAsset } from 'contentful';

export async function load(): Promise<LayoutData> {
	const [socialMedia, aboutData] = await Promise.all([
		client.getEntries({ content_type: 'socialMedia' }),
		client.getEntries({ content_type: 'about' })
	]);
	const aboutEntry = aboutData.items[0];
	const resume = formatAsset(aboutEntry.fields.resume as ContentfulAsset);

	return {
		socialMedia: socialMedia.items.map((item) => ({
			id: item.sys.id,
			title: String(item.fields.title) as IconType,
			link: String(item.fields.link)
		})),
		resumeLink: resume.url,
		backgroundImage: formatAsset(aboutEntry.fields.background as ContentfulAsset)
	};
}

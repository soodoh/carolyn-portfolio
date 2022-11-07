import { formatUrl, formatAsset, client } from './utils';
import type { Entry, EntryCollection, Asset } from 'contentful';

type SocialMediaFields = {
	title: string, link: string, icon: Asset,
}

export default async function getLayoutData() {
	const [socialMedia, aboutData] = await Promise.all([
		client.getEntries({ content_type: 'socialMedia' }),
		client.getEntries({ content_type: 'about' }),
	]);
	const aboutEntry = aboutData.items[0] as Entry<{ background: Asset }>;

	return {
		socialMedia: (socialMedia as EntryCollection<SocialMediaFields>).items.map((item) => ({
			id: item.sys.id,
			title: item.fields.title,
			link: formatUrl(item.fields.link),
			icon: formatAsset(item.fields.icon),
		})),
		backgroundImage: formatAsset(aboutEntry.fields.background),
	}
}

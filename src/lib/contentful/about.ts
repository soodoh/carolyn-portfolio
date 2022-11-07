import { formatAsset, client } from './utils';
import type { EntryCollection, Asset } from 'contentful';

type AboutFields = {
	profilePicture: Asset,
	bio: string,
	location: string,
	email: string,
	phoneNumber?: string,
	resume: Asset,
}

export default async function getAboutData() {
	const collection: EntryCollection<AboutFields> = await client.getEntries({ content_type: 'about' });
	const aboutData = collection.items[0];
	return {
		profilePicture: formatAsset(aboutData.fields.profilePicture),
		bio: aboutData.fields.bio,
		location: aboutData.fields.location,
		email: aboutData.fields.email,
		phoneNumber: aboutData.fields.phoneNumber || null,
		resume: formatAsset(aboutData.fields.resume),
	};
}

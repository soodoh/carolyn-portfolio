import type { Asset } from "contentful";
import pAll from "p-all";
import type { PhotosSkeleton } from "@/lib/contentful-types";
import { loadContentfulFixture } from "@/lib/load-contentful-fixture";
import { formatImage, getContentfulClient } from "./contentful-utils";
import type { Album, ImageType } from "./types";

export default async function getAlbums(): Promise<Album[]> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		return (await loadContentfulFixture()).albums;
	}

	const photoData = await getContentfulClient().getEntries<PhotosSkeleton>({
		content_type: "photos",
		order: ["fields.order"],
	});

	const albums: Album[] = await Promise.all(
		photoData.items.map(async (item) => {
			const imagePromises: Array<() => Promise<ImageType>> = Array.isArray(
				item.fields.photos,
			)
				? item.fields.photos.map(
						(photo) => async () => formatImage(photo as Asset),
					)
				: [];
			return {
				name: String(item.fields.album),
				photos: await pAll(imagePromises, { concurrency: 5 }),
			};
		}),
	);
	return albums;
}

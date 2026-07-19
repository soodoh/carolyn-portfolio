import pAll from "p-all";
import type { PhotosSkeleton } from "@/lib/contentful-types";
import {
	formatImage,
	getContentfulClient,
	requireContentfulAsset,
} from "@/lib/contentful-utils";
import { loadContentfulFixture } from "@/lib/load-contentful-fixture";
import type { Album, ImageType } from "@/lib/types";

async function formatPhotos(
	photos: unknown,
	albumName: string,
): Promise<ImageType[]> {
	const photoAssets = Array.isArray(photos) ? photos : [];
	const imagePromises = photoAssets.map(
		(photo, index) => async (): Promise<ImageType> =>
			formatImage(
				requireContentfulAsset(
					photo,
					`Photo ${index + 1} in album ${albumName}`,
				),
			),
	);
	return pAll(imagePromises, { concurrency: 5 });
}

export async function getAlbumNames(): Promise<string[]> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		return (await loadContentfulFixture()).albums.map((album) => album.name);
	}

	const contentfulClient = await getContentfulClient();
	const photoData = await contentfulClient.getEntries<PhotosSkeleton>({
		content_type: "photos",
		order: ["fields.order"],
		select: ["fields.album"],
	});
	return photoData.items.map((item) => {
		if (typeof item.fields.album !== "string" || !item.fields.album) {
			throw new Error(`Photo entry ${item.sys.id} is missing an album name.`);
		}
		return item.fields.album;
	});
}

export async function getFirstAlbum(): Promise<Album> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		const album = (await loadContentfulFixture()).albums[0];
		if (!album) {
			throw new Error("No photography albums are configured.");
		}
		return album;
	}

	const contentfulClient = await getContentfulClient();
	const photoData = await contentfulClient.getEntries<PhotosSkeleton>({
		content_type: "photos",
		order: ["fields.order"],
		limit: 1,
	});
	const item = photoData.items[0];
	if (typeof item?.fields.album !== "string" || !item.fields.album) {
		throw new Error("No photography albums are configured.");
	}
	return {
		name: item.fields.album,
		photos: await formatPhotos(item.fields.photos, item.fields.album),
	};
}

export async function getAlbum(albumName: string): Promise<Album> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		const album = (await loadContentfulFixture()).albums.find(
			(candidate) => candidate.name === albumName,
		);
		if (!album) {
			throw new Error(`Photo album not found: ${albumName}`);
		}
		return album;
	}

	const contentfulClient = await getContentfulClient();
	const photoData = await contentfulClient.getEntries<PhotosSkeleton>({
		content_type: "photos",
		"fields.album": albumName,
		limit: 1,
	});
	const item = photoData.items[0];
	if (!item || item.fields.album !== albumName) {
		throw new Error(`Photo album not found: ${albumName}`);
	}
	return {
		name: albumName,
		photos: await formatPhotos(item.fields.photos, albumName),
	};
}

export default async function getAlbums(): Promise<Album[]> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		return (await loadContentfulFixture()).albums;
	}

	const contentfulClient = await getContentfulClient();
	const photoData = await contentfulClient.getEntries<PhotosSkeleton>({
		content_type: "photos",
		order: ["fields.order"],
	});

	return Promise.all(
		photoData.items.map(async (item) => {
			if (typeof item.fields.album !== "string" || !item.fields.album) {
				throw new Error(`Photo entry ${item.sys.id} is missing an album name.`);
			}
			return {
				name: item.fields.album,
				photos: await formatPhotos(item.fields.photos, item.fields.album),
			};
		}),
	);
}

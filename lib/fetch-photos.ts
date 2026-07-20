import {
	type ContentSourceLoader,
	getContentSource,
} from "@/lib/content-source";
import type { PhotosSkeleton } from "@/lib/contentful-types";
import {
	type ContentfulEntry,
	formatImage,
	getAllContentfulEntries,
	parseContentfulEntries,
	requireContentfulAsset,
} from "@/lib/contentful-utils";
import { validateAlbumName } from "@/lib/server-function-inputs";
import type { Album, ImageType } from "@/lib/types";

function formatPhotos(photos: unknown, albumName: string): ImageType[] {
	if (!Array.isArray(photos)) {
		throw new Error(`Photo album ${albumName} is missing its photos.`);
	}
	const photoAssets = photos;
	return photoAssets.map((photo, index) =>
		formatImage(
			requireContentfulAsset(photo, `Photo ${index + 1} in album ${albumName}`),
		),
	);
}

function formatAlbumName(item: ContentfulEntry): string {
	try {
		return validateAlbumName(item.fields.album);
	} catch {
		throw new Error(`Photo entry ${item.sys.id} has a malformed album name.`);
	}
}

function validateUniqueAlbumNames(albumNames: string[]): void {
	const names = new Set<string>();
	for (const albumName of albumNames) {
		validateAlbumName(albumName);
		if (names.has(albumName)) {
			throw new Error(`Duplicate photography album name: ${albumName}`);
		}
		names.add(albumName);
	}
}

function formatAlbum(item: ContentfulEntry): Album {
	const albumName = formatAlbumName(item);
	return {
		name: albumName,
		photos: formatPhotos(item.fields.photos, albumName),
	};
}

export async function loadInitialPhotographyData(
	loadAlbums: () => Promise<Album[]>,
): Promise<{
	albumNames: string[];
	initialAlbum: Album;
}> {
	const albums = await loadAlbums();
	const initialAlbum = albums[0];
	if (!initialAlbum) {
		throw new Error("No photography albums are configured.");
	}
	const albumNames = albums.map((album) => album.name);
	validateUniqueAlbumNames(albumNames);
	return {
		albumNames,
		initialAlbum,
	};
}

export function getInitialPhotographyData(): Promise<{
	albumNames: string[];
	initialAlbum: Album;
}> {
	return getInitialPhotographyDataFromSource(getContentSource);
}

export async function getInitialPhotographyDataFromSource(
	loadSource: ContentSourceLoader,
): Promise<{
	albumNames: string[];
	initialAlbum: Album;
}> {
	const source = await loadSource();
	if (source.kind === "fixture") {
		return loadInitialPhotographyData(async () => source.content.albums);
	}

	const [nameEntries, firstAlbumResponse] = await Promise.all([
		getAllContentfulEntries(
			(skip, limit) =>
				source.client.getEntries<PhotosSkeleton>({
					content_type: "photos",
					limit,
					order: ["fields.order"],
					select: ["fields.album"],
					skip,
				}),
			"Photo album names query",
		),
		source.client.getEntries<PhotosSkeleton>({
			content_type: "photos",
			limit: 1,
			order: ["fields.order"],
		}),
	]);
	const albumNames = nameEntries.map(formatAlbumName);
	validateUniqueAlbumNames(albumNames);
	const firstAlbumEntries = parseContentfulEntries(
		firstAlbumResponse,
		"Initial photo album query",
	);
	const firstAlbumEntry = firstAlbumEntries.items[0];
	if (!firstAlbumEntry) {
		throw new Error("No photography albums are configured.");
	}
	const initialAlbum = formatAlbum(firstAlbumEntry);
	if (albumNames[0] !== initialAlbum.name) {
		throw new Error(
			"Initial photography queries returned inconsistent albums.",
		);
	}
	return { albumNames, initialAlbum };
}

export function getAlbum(albumName: string): Promise<Album> {
	return getAlbumFromSource(albumName, getContentSource);
}

export async function getAlbumFromSource(
	albumName: string,
	loadSource: ContentSourceLoader,
): Promise<Album> {
	validateAlbumName(albumName);
	const source = await loadSource();
	if (source.kind === "fixture") {
		const matches = source.content.albums.filter(
			(candidate) => candidate.name === albumName,
		);
		if (matches.length > 1) {
			throw new Error(`Duplicate photography album name: ${albumName}`);
		}
		const album = matches[0];
		if (!album) {
			throw new Error(`Photo album not found: ${albumName}`);
		}
		return album;
	}

	const photoData = parseContentfulEntries(
		await source.client.getEntries<PhotosSkeleton>({
			content_type: "photos",
			"fields.album": albumName,
			limit: 2,
		}),
		"Photo album query",
	);
	if (photoData.total > 1 || photoData.items.length > 1) {
		throw new Error(`Duplicate photography album name: ${albumName}`);
	}
	const item = photoData.items[0];
	if (!item || item.fields.album !== albumName) {
		throw new Error(`Photo album not found: ${albumName}`);
	}
	return formatAlbum(item);
}

export default function getAlbums(): Promise<Album[]> {
	return getAlbumsFromSource(getContentSource);
}

export async function getAlbumsFromSource(
	loadSource: ContentSourceLoader,
): Promise<Album[]> {
	const source = await loadSource();
	if (source.kind === "fixture") {
		return source.content.albums;
	}

	const albums = await getAllContentfulEntries(
		(skip, limit) =>
			source.client.getEntries<PhotosSkeleton>({
				content_type: "photos",
				limit,
				skip,
				order: ["fields.order"],
			}),
		"Photo albums query",
	);
	const formattedAlbums = albums.map(formatAlbum);
	validateUniqueAlbumNames(formattedAlbums.map((album) => album.name));
	return formattedAlbums;
}

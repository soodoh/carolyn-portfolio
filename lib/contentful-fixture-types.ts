import type { Document } from "@contentful/rich-text-types";
import { isContentfulImageUrl } from "@/lib/contentful-url-policy";
import { decodeImage } from "@/lib/image-type";
import { validateAlbumName } from "@/lib/server-function-inputs";
import { parseSocialMediaLink } from "@/lib/social-media-link";
import {
	type AboutData,
	type Album,
	type ImageType,
	isIconType,
	isProjectType,
	type Project,
	type ProjectInfo,
	type SocialMedia,
} from "@/lib/types";

type FixtureProjectInfo = ProjectInfo & { password?: string };

export type ContentfulFixture = {
	backgroundImage: ImageType;
	socialMedia: SocialMedia[];
	about: AboutData;
	resumeUrl: string;
	projects: Project[];
	projectInfo: Record<string, FixtureProjectInfo>;
	albums: Album[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDocument(value: unknown): value is Document {
	return (
		isRecord(value) &&
		value.nodeType === "document" &&
		isRecord(value.data) &&
		Array.isArray(value.content)
	);
}

function decodeRequiredImage(value: unknown): ImageType {
	const image = decodeImage(value);
	if (!image) {
		throw new Error("Fixture contains an invalid image.");
	}
	if (
		!isContentfulImageUrl(image.url) &&
		!/^\/test-assets\/[A-Za-z0-9_-]+\.jpg$/.test(image.url)
	) {
		throw new Error("Fixture image URL must use an approved source.");
	}
	return image;
}

function validateDocumentImages(value: unknown): void {
	if (Array.isArray(value)) {
		for (const item of value) {
			validateDocumentImages(item);
		}
		return;
	}
	if (!isRecord(value)) {
		return;
	}
	if ("image" in value) {
		decodeRequiredImage(value.image);
	}
	for (const nested of Object.values(value)) {
		validateDocumentImages(nested);
	}
}

function isSocialMedia(value: unknown): value is SocialMedia {
	if (
		!isRecord(value) ||
		typeof value.id !== "string" ||
		!isIconType(value.title)
	) {
		return false;
	}
	parseSocialMediaLink(value.title, value.link);
	return true;
}

function isProject(value: unknown): value is Project {
	if (
		!isRecord(value) ||
		typeof value.id !== "string" ||
		typeof value.title !== "string" ||
		typeof value.slug !== "string" ||
		!Array.isArray(value.projectType) ||
		!value.projectType.every(isProjectType) ||
		typeof value.summary !== "string"
	) {
		return false;
	}
	decodeRequiredImage(value.coverImage);
	return true;
}

function isProjectInfo(value: unknown): value is FixtureProjectInfo {
	if (
		!isRecord(value) ||
		!isProject(value) ||
		("role" in value &&
			value.role !== undefined &&
			typeof value.role !== "string") ||
		!("description" in value) ||
		!isDocument(value.description) ||
		("videoLink" in value &&
			value.videoLink !== undefined &&
			typeof value.videoLink !== "string") ||
		("password" in value &&
			value.password !== undefined &&
			typeof value.password !== "string")
	) {
		return false;
	}
	validateDocumentImages(value.description);
	return true;
}

function isProjectInfoRecord(
	value: unknown,
): value is Record<string, FixtureProjectInfo> {
	return isRecord(value) && Object.values(value).every(isProjectInfo);
}

function isAlbum(value: unknown): value is Album {
	if (!isRecord(value) || !Array.isArray(value.photos)) {
		return false;
	}
	validateAlbumName(value.name);
	for (const photo of value.photos) {
		decodeRequiredImage(photo);
	}
	return true;
}

function isAboutData(value: unknown): value is AboutData {
	if (
		!isRecord(value) ||
		!isDocument(value.bio) ||
		typeof value.location !== "string" ||
		typeof value.email !== "string"
	) {
		return false;
	}
	decodeRequiredImage(value.profilePicture);
	validateDocumentImages(value.bio);
	return true;
}

function validateUniqueAlbumNames(albums: Album[]): void {
	const names = new Set<string>();
	for (const album of albums) {
		if (names.has(album.name)) {
			throw new Error(`Duplicate photography album name: ${album.name}`);
		}
		names.add(album.name);
	}
}

export function parseContentfulFixture(value: unknown): ContentfulFixture {
	if (
		!isRecord(value) ||
		!Array.isArray(value.socialMedia) ||
		!value.socialMedia.every(isSocialMedia) ||
		!isAboutData(value.about) ||
		typeof value.resumeUrl !== "string" ||
		!Array.isArray(value.projects) ||
		!value.projects.every(isProject) ||
		!isProjectInfoRecord(value.projectInfo) ||
		!Array.isArray(value.albums) ||
		!value.albums.every(isAlbum)
	) {
		throw new Error("Contentful fixture does not match the runtime contract.");
	}
	const backgroundImage = decodeRequiredImage(value.backgroundImage);
	validateUniqueAlbumNames(value.albums);
	return {
		backgroundImage,
		socialMedia: value.socialMedia,
		about: value.about,
		resumeUrl: value.resumeUrl,
		projects: value.projects,
		projectInfo: value.projectInfo,
		albums: value.albums,
	};
}

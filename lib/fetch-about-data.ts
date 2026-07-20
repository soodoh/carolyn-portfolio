import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import {
	type ContentfulDeliveryClient,
	type ContentSourceLoader,
	getContentSource,
} from "@/lib/content-source";
import type { AboutSkeleton } from "@/lib/contentful-types";
import { isContentfulAssetUrl } from "@/lib/contentful-url-policy";
import {
	formatAsset,
	formatImage,
	parseExactContentfulEntry,
	requireContentfulAsset,
} from "@/lib/contentful-utils";
import type { AboutData, ImageType } from "@/lib/types";

function requireText(value: unknown, context: string): string {
	if (typeof value !== "string" || !value) {
		throw new Error(`${context} is missing.`);
	}
	return value;
}

async function getAboutEntry(client: ContentfulDeliveryClient) {
	return parseExactContentfulEntry(
		await client.getEntries<AboutSkeleton>({
			content_type: "about",
			limit: 1,
		}),
		"About query",
	);
}

async function formatAboutData(
	aboutEntry: Awaited<ReturnType<typeof getAboutEntry>>,
): Promise<AboutData> {
	const bio = requireText(aboutEntry.fields.bio, "About bio");
	return {
		profilePicture: formatImage(
			requireContentfulAsset(
				aboutEntry.fields.profilePicture,
				"About profile picture",
			),
		),
		bio: await richTextFromMarkdown(bio),
		location: requireText(aboutEntry.fields.location, "About location"),
		email: requireText(aboutEntry.fields.email, "About email"),
	};
}

function formatBackgroundImage(
	aboutEntry: Awaited<ReturnType<typeof getAboutEntry>>,
): ImageType {
	return formatImage(
		requireContentfulAsset(
			aboutEntry.fields.background,
			"About background image",
		),
	);
}

function formatResumeUrl(
	aboutEntry: Awaited<ReturnType<typeof getAboutEntry>>,
): string {
	const resumeAsset = requireContentfulAsset(
		aboutEntry.fields.resume,
		"About resume",
	);
	return validateResumeUrl(formatAsset(resumeAsset).url);
}

export function getAboutContent(): Promise<{
	backgroundImage: ImageType;
	aboutData: AboutData;
	resumeUrl: string;
}> {
	return getAboutContentFromSource(getContentSource);
}

export async function getAboutContentFromSource(
	loadSource: ContentSourceLoader,
): Promise<{
	backgroundImage: ImageType;
	aboutData: AboutData;
	resumeUrl: string;
}> {
	const source = await loadSource();
	if (source.kind === "fixture") {
		return {
			backgroundImage: source.content.backgroundImage,
			aboutData: source.content.about,
			resumeUrl: validateResumeUrl(source.content.resumeUrl),
		};
	}
	const aboutEntry = await getAboutEntry(source.client);
	return {
		backgroundImage: formatBackgroundImage(aboutEntry),
		aboutData: await formatAboutData(aboutEntry),
		resumeUrl: formatResumeUrl(aboutEntry),
	};
}

export function getAboutPageData(): Promise<{
	backgroundImage: ImageType;
	aboutData: AboutData;
}> {
	return getAboutPageDataFromSource(getContentSource);
}

export async function getAboutPageDataFromSource(
	loadSource: ContentSourceLoader,
): Promise<{
	backgroundImage: ImageType;
	aboutData: AboutData;
}> {
	const source = await loadSource();
	if (source.kind === "fixture") {
		return {
			backgroundImage: source.content.backgroundImage,
			aboutData: source.content.about,
		};
	}
	const aboutEntry = await getAboutEntry(source.client);
	return {
		backgroundImage: formatBackgroundImage(aboutEntry),
		aboutData: await formatAboutData(aboutEntry),
	};
}

export function getResumeUrl(): Promise<string> {
	return getResumeUrlFromSource(getContentSource);
}

export async function getResumeUrlFromSource(
	loadSource: ContentSourceLoader,
): Promise<string> {
	const source = await loadSource();
	if (source.kind === "fixture") {
		return validateResumeUrl(source.content.resumeUrl);
	}
	return formatResumeUrl(await getAboutEntry(source.client));
}

export function validateResumeUrl(rawUrl: string): string {
	if (!isContentfulAssetUrl(rawUrl)) {
		throw new Error("The resume must be hosted on Contentful over HTTPS.");
	}
	return new URL(rawUrl).toString();
}

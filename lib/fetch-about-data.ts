import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import type { AboutSkeleton } from "@/lib/contentful-types";
import {
	formatImage,
	formatUrl,
	getContentfulClient,
	requireContentfulAsset,
} from "@/lib/contentful-utils";
import { loadContentfulFixture } from "@/lib/load-contentful-fixture";
import type { AboutData } from "@/lib/types";

function requireText(value: unknown, context: string): string {
	if (typeof value !== "string" || !value) {
		throw new Error(`${context} is missing.`);
	}
	return value;
}

async function getAboutEntry() {
	const aboutData = await getContentfulClient().getEntries<AboutSkeleton>({
		content_type: "about",
		limit: 1,
	});
	const aboutEntry = aboutData.items[0];
	if (!aboutEntry) {
		throw new Error("Contentful has no about entry.");
	}
	return aboutEntry;
}

export async function getAboutData(): Promise<AboutData> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		return (await loadContentfulFixture()).about;
	}

	const aboutEntry = await getAboutEntry();
	const bio = requireText(aboutEntry.fields.bio, "About bio");
	const [bioDocument, profilePicture] = await Promise.all([
		richTextFromMarkdown(bio),
		formatImage(
			requireContentfulAsset(
				aboutEntry.fields.profilePicture,
				"About profile picture",
			),
		),
	]);

	return {
		profilePicture,
		bio: bioDocument,
		location: requireText(aboutEntry.fields.location, "About location"),
		email: requireText(aboutEntry.fields.email, "About email"),
	};
}

export async function getResumeUrl(): Promise<string> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		return validateResumeUrl((await loadContentfulFixture()).resumeUrl);
	}

	const aboutEntry = await getAboutEntry();
	const resumeAsset = requireContentfulAsset(
		aboutEntry.fields.resume,
		"About resume",
	);
	const fileUrl = resumeAsset.fields.file?.url;
	if (typeof fileUrl !== "string") {
		throw new Error("The resume asset is missing a file URL.");
	}
	return validateResumeUrl(formatUrl(fileUrl));
}

export function validateResumeUrl(rawUrl: string): string {
	const url = new URL(rawUrl);
	if (
		url.protocol !== "https:" ||
		!(
			url.hostname === "ctfassets.net" ||
			url.hostname.endsWith(".ctfassets.net")
		)
	) {
		throw new Error("The resume must be hosted on Contentful over HTTPS.");
	}
	return url.toString();
}

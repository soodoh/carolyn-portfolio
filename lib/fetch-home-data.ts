import type {
	AboutSkeleton,
	SocialMediaSkeleton,
} from "@/lib/contentful-types";
import {
	formatImage,
	getContentfulClient,
	requireContentfulAsset,
} from "@/lib/contentful-utils";
import { loadContentfulFixture } from "@/lib/load-contentful-fixture";
import type { IconType, ImageType, SocialMedia } from "@/lib/types";

function isIconType(value: unknown): value is IconType {
	return value === "instagram" || value === "linkedin";
}

export async function getBackgroundImage(): Promise<ImageType> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		return (await loadContentfulFixture()).backgroundImage;
	}

	const contentfulClient = await getContentfulClient();
	const aboutData = await contentfulClient.getEntries<AboutSkeleton>({
		content_type: "about",
		limit: 1,
		select: ["fields.background"],
	});
	const aboutEntry = aboutData.items[0];
	if (!aboutEntry) {
		throw new Error("Contentful has no about entry.");
	}
	return formatImage(
		requireContentfulAsset(
			aboutEntry.fields.background,
			"About background image",
		),
	);
}

export async function getSocialMedia(): Promise<SocialMedia[]> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		return (await loadContentfulFixture()).socialMedia;
	}

	const contentfulClient = await getContentfulClient();
	const socialMedia = await contentfulClient.getEntries<SocialMediaSkeleton>({
		content_type: "socialMedia",
	});
	return socialMedia.items.map((item) => {
		const { link, title } = item.fields;
		if (!isIconType(title) || typeof link !== "string" || !link) {
			throw new Error(`Social media entry ${item.sys.id} is malformed.`);
		}
		return { id: item.sys.id, title, link };
	});
}

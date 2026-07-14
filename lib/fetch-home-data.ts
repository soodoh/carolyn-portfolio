import type { Asset } from "contentful";
import type {
	AboutSkeleton,
	SocialMediaSkeleton,
} from "@/lib/contentful-types";
import { formatImage, getContentfulClient } from "@/lib/contentful-utils";
import { loadContentfulFixture } from "@/lib/load-contentful-fixture";
import type { IconType, ImageType, SocialMedia } from "@/lib/types";

export async function getBackgroundImage(): Promise<ImageType> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		return (await loadContentfulFixture()).backgroundImage;
	}

	const aboutData = await getContentfulClient().getEntries<AboutSkeleton>({
		content_type: "about",
	});
	const backgroundAsset = aboutData.items[0]?.fields.background as Asset;
	const backgroundImage = await formatImage(backgroundAsset);

	return backgroundImage;
}

export async function getSocialMedia(): Promise<SocialMedia[]> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		return (await loadContentfulFixture()).socialMedia;
	}

	const socialMedia =
		await getContentfulClient().getEntries<SocialMediaSkeleton>({
			content_type: "socialMedia",
		});
	return socialMedia.items.map((item) => ({
		id: item.sys.id,
		title: String(item.fields.title) as IconType,
		link: String(item.fields.link),
	}));
}

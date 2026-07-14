import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import type { Asset } from "contentful";
import type { AboutSkeleton } from "@/lib/contentful-types";
import { loadContentfulFixture } from "@/lib/load-contentful-fixture";
import type { AboutData } from "@/lib/types";
import {
	formatImage,
	formatUrl,
	getContentfulClient,
} from "./contentful-utils";

export async function getAboutData(): Promise<AboutData> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		return (await loadContentfulFixture()).about;
	}

	const aboutData = await getContentfulClient().getEntries<AboutSkeleton>({
		content_type: "about",
	});
	const aboutEntry = aboutData.items[0];

	const bioDocument = await richTextFromMarkdown(String(aboutEntry.fields.bio));
	const profilePicture = await formatImage(
		aboutEntry.fields.profilePicture as Asset,
	);

	return {
		profilePicture,
		bio: bioDocument,
		location: String(aboutEntry.fields.location),
		email: String(aboutEntry.fields.email),
	};
}

export async function getResumeUrl(): Promise<string> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		return (await loadContentfulFixture()).resumeUrl;
	}

	const aboutData = await getContentfulClient().getEntries<AboutSkeleton>({
		content_type: "about",
	});
	const aboutEntry = aboutData.items[0];
	const resumeAsset = aboutEntry.fields.resume as Asset;
	const fileUrl = resumeAsset.fields.file?.url;
	const resumeUrl = formatUrl(typeof fileUrl === "string" ? fileUrl : "");

	return resumeUrl;
}

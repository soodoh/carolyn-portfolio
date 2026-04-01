import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import type { Asset } from "contentful";
import type { AboutSkeleton } from "@/lib/contentful-types";
import type { AboutData } from "@/lib/types";
import { client, formatImage, formatUrl } from "./contentful-utils";

export async function getAboutData(): Promise<AboutData> {
	const aboutData = await client.getEntries<AboutSkeleton>({
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
	const aboutData = await client.getEntries<AboutSkeleton>({
		content_type: "about",
	});
	const aboutEntry = aboutData.items[0];
	const resumeAsset = aboutEntry.fields.resume as Asset;
	const fileUrl = resumeAsset.fields.file?.url;
	const resumeUrl = formatUrl(typeof fileUrl === "string" ? fileUrl : "");

	return resumeUrl;
}

import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import { client, formatImage, formatUrl } from "./contentful-utils";
import type { AboutData } from "@/lib/types";
import type { Asset } from "contentful";

export async function getAboutData(): Promise<AboutData> {
  const aboutData = await client.getEntries({ content_type: "about" });
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
  const aboutData = await client.getEntries({ content_type: "about" });
  const aboutEntry = aboutData.items[0];
  const resumeAsset = aboutEntry.fields.resume as Asset;
  const resumeUrl = formatUrl(String(resumeAsset.fields.file?.url));

  return resumeUrl;
}

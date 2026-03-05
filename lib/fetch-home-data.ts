import { client, formatImage } from "@/lib/contentful-utils";
import type {
  AboutSkeleton,
  SocialMediaSkeleton,
} from "@/lib/contentful-types";
import type { IconType, ImageType, SocialMedia } from "@/lib/types";
import type { Asset } from "contentful";

export async function getBackgroundImage(): Promise<ImageType> {
  const aboutData = await client.getEntries<AboutSkeleton>({
    content_type: "about",
  });
  const backgroundAsset = aboutData.items[0]?.fields.background as Asset;
  const backgroundImage = await formatImage(backgroundAsset);

  return backgroundImage;
}

export async function getSocialMedia(): Promise<SocialMedia[]> {
  const socialMedia = await client.getEntries<SocialMediaSkeleton>({
    content_type: "socialMedia",
  });
  return socialMedia.items.map((item) => ({
    id: item.sys.id,
    title: String(item.fields.title) as IconType,
    link: String(item.fields.link),
  }));
}

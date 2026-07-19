import type { Asset as ContentfulAsset, UnresolvedLink } from "contentful";
import { createClient } from "contentful";
import { getImageMetadataAndPlaceholder } from "@/lib/image-utils";
import { getContentfulAccessToken } from "@/lib/server-secrets.server";
import type { Asset, ImagePlaceholder, ImageType } from "@/lib/types";

let contentfulClient: Promise<ReturnType<typeof createClient>> | undefined;

export function getContentfulClient(): Promise<
	ReturnType<typeof createClient>
> {
	contentfulClient ??= createContentfulClient();
	return contentfulClient;
}

async function createContentfulClient(): Promise<
	ReturnType<typeof createClient>
> {
	const space = process.env.CONTENTFUL_SPACE_ID;
	if (!space) {
		throw new Error("Missing CONTENTFUL_SPACE_ID environment variable");
	}
	const accessToken = await getContentfulAccessToken();
	return createClient({ space, accessToken });
}

export function formatUrl(rawUrl: string): string {
	if (!rawUrl) {
		throw new Error("Contentful asset is missing a URL.");
	}
	const url = new URL(rawUrl.startsWith("//") ? `https:${rawUrl}` : rawUrl);
	if (url.protocol !== "https:") {
		throw new Error(`Contentful asset URL must use HTTPS: ${rawUrl}`);
	}
	return url.toString();
}

export function requireContentfulAsset(
	asset: ContentfulAsset<undefined> | UnresolvedLink<"Asset"> | undefined,
	context: string,
): ContentfulAsset<undefined> {
	if (!asset || !("fields" in asset)) {
		throw new Error(`${context} is missing a resolved Contentful asset.`);
	}
	return asset;
}

export function formatAsset(asset: ContentfulAsset<undefined>): Asset {
	const fileUrl = asset.fields.file?.url;
	if (typeof fileUrl !== "string") {
		throw new Error(`Contentful asset ${asset.sys.id} is missing a file URL.`);
	}
	const title = asset.fields.title;
	const description = asset.fields.description;
	return {
		id: asset.sys.id,
		title: typeof title === "string" ? title : "",
		description: typeof description === "string" ? description : "",
		url: formatUrl(fileUrl),
	};
}

export function getContentfulPlaceholder(url: string): ImagePlaceholder {
	const placeholderUrl = new URL(url);
	placeholderUrl.searchParams.set("w", "25");
	placeholderUrl.searchParams.set("q", "30");
	placeholderUrl.searchParams.set("fm", "jpg");
	return placeholderUrl.toString();
}

export function formatImage(
	contentfulAsset: ContentfulAsset<undefined>,
): ImageType {
	const asset = formatAsset(contentfulAsset);
	const file = contentfulAsset.fields.file;
	if (!file || !("details" in file)) {
		throw new Error(`Contentful image ${asset.id} is missing file details.`);
	}
	const imageDetails = file.details.image;
	const width = imageDetails?.width;
	const height = imageDetails?.height;
	if (!width || !height) {
		throw new Error(`Contentful image ${asset.id} is missing dimensions.`);
	}
	return {
		...asset,
		width,
		height,
		placeholder: getContentfulPlaceholder(asset.url),
	};
}

type RichTextImageMetadata = Pick<
	ImageType,
	"width" | "height" | "placeholder"
>;

const richTextImageCache = new Map<string, Promise<RichTextImageMetadata>>();

function getRichTextImageMetadata(url: string): Promise<RichTextImageMetadata> {
	const cached = richTextImageCache.get(url);
	if (cached) {
		return cached;
	}

	const pending = getImageMetadataAndPlaceholder(url);
	richTextImageCache.set(url, pending);
	void pending.catch(() => {
		if (richTextImageCache.get(url) === pending) {
			richTextImageCache.delete(url);
		}
	});
	return pending;
}

export async function getImageAssetFromRichTextNode(
	rawUrl: string,
	alt: string,
): Promise<ImageType> {
	const url = formatUrl(rawUrl);
	const metadata = await getRichTextImageMetadata(url);
	return {
		id: url,
		title: alt,
		description: alt,
		url,
		...metadata,
	};
}

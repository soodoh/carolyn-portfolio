import { createClient } from "contentful";
import { requireContentfulImageUrl } from "@/lib/contentful-url-policy";
import { isPositiveSafeInteger } from "@/lib/image-type";
import { getContentfulAccessToken } from "@/lib/server-secrets.server";
import type { Asset, ImagePlaceholder, ImageType } from "@/lib/types";

export type ContentfulEntry = {
	sys: { id: string };
	fields: Record<string, unknown>;
};

export type ContentfulEntries = {
	items: ContentfulEntry[];
	total: number;
};

type ContentfulAsset = ContentfulEntry;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseContentfulEntry(
	value: unknown,
	context: string,
): ContentfulEntry {
	if (
		!isRecord(value) ||
		!isRecord(value.sys) ||
		typeof value.sys.id !== "string" ||
		!value.sys.id ||
		!isRecord(value.fields)
	) {
		throw new Error(`${context} contains a malformed Contentful entry.`);
	}
	return { sys: { id: value.sys.id }, fields: value.fields };
}

export function parseContentfulEntries(
	value: unknown,
	context: string,
): ContentfulEntries {
	if (
		!isRecord(value) ||
		!Array.isArray(value.items) ||
		typeof value.total !== "number" ||
		!Number.isInteger(value.total) ||
		value.total < 0
	) {
		throw new Error(`${context} returned a malformed Contentful response.`);
	}
	return {
		items: value.items.map((item) => parseContentfulEntry(item, context)),
		total: value.total,
	};
}

export function parseExactContentfulEntry(
	value: unknown,
	context: string,
): ContentfulEntry {
	const entries = parseContentfulEntries(value, context);
	if (entries.total !== 1 || entries.items.length !== 1) {
		throw new Error(`${context} did not return exactly one entry.`);
	}
	return entries.items[0];
}

export async function getAllContentfulEntries(
	loadPage: (skip: number, limit: number) => Promise<unknown>,
	context: string,
	pageSize = 1000,
): Promise<ContentfulEntry[]> {
	const items: ContentfulEntry[] = [];
	const entryIds = new Set<string>();
	let expectedTotal: number | undefined;
	do {
		const page = parseContentfulEntries(
			await loadPage(items.length, pageSize),
			context,
		);
		if (expectedTotal === undefined) {
			expectedTotal = page.total;
		} else if (page.total !== expectedTotal) {
			throw new Error(`${context} returned an inconsistent total.`);
		}
		if (items.length + page.items.length > expectedTotal) {
			throw new Error(`${context} returned an inconsistent total.`);
		}
		if (page.items.length === 0 && items.length < expectedTotal) {
			throw new Error(`${context} returned an incomplete page.`);
		}
		for (const item of page.items) {
			if (entryIds.has(item.sys.id)) {
				throw new Error(
					`${context} returned duplicate entry ID ${item.sys.id}.`,
				);
			}
			entryIds.add(item.sys.id);
		}
		items.push(...page.items);
	} while (items.length < expectedTotal);
	return items;
}

let contentfulClient: Promise<ReturnType<typeof createClient>> | undefined;

export function getContentfulClient(): Promise<
	ReturnType<typeof createClient>
> {
	if (!contentfulClient) {
		const pendingClient = createContentfulClient();
		contentfulClient = pendingClient;
		void pendingClient.catch(() => {
			if (contentfulClient === pendingClient) {
				contentfulClient = undefined;
			}
		});
	}
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
	asset: unknown,
	context: string,
): ContentfulAsset {
	try {
		return parseContentfulEntry(asset, context);
	} catch {
		throw new Error(`${context} is missing a resolved Contentful asset.`);
	}
}

export function formatAsset(asset: ContentfulAsset): Asset {
	const file = asset.fields.file;
	const fileUrl = isRecord(file) ? file.url : undefined;
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

export function formatImage(contentfulAsset: ContentfulAsset): ImageType {
	const asset = formatAsset(contentfulAsset);
	requireContentfulImageUrl(asset.url);
	const file = contentfulAsset.fields.file;
	if (!isRecord(file) || !isRecord(file.details)) {
		throw new Error(`Contentful image ${asset.id} is missing file details.`);
	}
	const imageDetails = file.details.image;
	const width = isRecord(imageDetails) ? imageDetails.width : undefined;
	const height = isRecord(imageDetails) ? imageDetails.height : undefined;
	if (!isPositiveSafeInteger(width) || !isPositiveSafeInteger(height)) {
		throw new Error(`Contentful image ${asset.id} is missing dimensions.`);
	}
	return {
		...asset,
		width,
		height,
		placeholder: getContentfulPlaceholder(asset.url),
	};
}

type ContentfulAssetLoader = (assetId: string) => Promise<unknown>;

const richTextImageCache = new WeakMap<
	ContentfulAssetLoader,
	Map<string, Promise<ImageType>>
>();

export function getContentfulAssetId(rawUrl: string): string {
	const url = requireContentfulImageUrl(formatUrl(rawUrl));
	const [, assetId] = url.pathname.split("/").filter(Boolean);
	if (!assetId || !/^[A-Za-z0-9_-]+$/.test(assetId)) {
		throw new Error("Contentful image URL is missing a valid asset ID.");
	}
	return assetId;
}

function loadRichTextImage(
	loadAsset: ContentfulAssetLoader,
	url: string,
): Promise<ImageType> {
	let loaderCache = richTextImageCache.get(loadAsset);
	if (!loaderCache) {
		loaderCache = new Map();
		richTextImageCache.set(loadAsset, loaderCache);
	}
	const cached = loaderCache.get(url);
	if (cached) {
		return cached;
	}

	const pending = loadAsset(getContentfulAssetId(url)).then((asset) =>
		formatImage(requireContentfulAsset(asset, "Project markdown image")),
	);
	loaderCache.set(url, pending);
	void pending.catch(() => {
		if (loaderCache.get(url) === pending) {
			loaderCache.delete(url);
		}
	});
	return pending;
}

export async function getImageAssetFromRichTextNode(
	loadAsset: ContentfulAssetLoader,
	rawUrl: string,
	alt: string,
): Promise<ImageType> {
	const url = formatUrl(rawUrl);
	const image = await loadRichTextImage(loadAsset, url);
	return {
		...image,
		title: alt,
		description: alt,
	};
}

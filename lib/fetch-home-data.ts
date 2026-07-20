import {
	type ContentfulDeliveryClient,
	type ContentSourceLoader,
	getContentSource,
} from "@/lib/content-source";
import type {
	AboutSkeleton,
	SocialMediaSkeleton,
} from "@/lib/contentful-types";
import {
	formatImage,
	getAllContentfulEntries,
	parseExactContentfulEntry,
	requireContentfulAsset,
} from "@/lib/contentful-utils";
import { parseSocialMediaLink } from "@/lib/social-media-link";
import { type ImageType, isIconType, type SocialMedia } from "@/lib/types";

const SOCIAL_MEDIA_CACHE_TTL_MS = 5 * 60 * 1000;

type SocialMediaLoader = () => Promise<SocialMedia[]>;

export function createSocialMediaCache(
	ttlMs: number,
): (load: SocialMediaLoader, now?: number) => Promise<SocialMedia[]> {
	let cached: { expiresAt: number; value: Promise<SocialMedia[]> } | undefined;
	return (load, now = Date.now()) => {
		if (cached && cached.expiresAt > now) {
			return cached.value;
		}
		const pending = load();
		cached = { expiresAt: now + ttlMs, value: pending };
		void pending.catch(() => {
			if (cached?.value === pending) {
				cached = undefined;
			}
		});
		return pending;
	};
}

const socialMediaCaches = new WeakMap<
	ContentfulDeliveryClient,
	ReturnType<typeof createSocialMediaCache>
>();

function getSocialMediaCache(client: ContentfulDeliveryClient) {
	let cache = socialMediaCaches.get(client);
	if (!cache) {
		cache = createSocialMediaCache(SOCIAL_MEDIA_CACHE_TTL_MS);
		socialMediaCaches.set(client, cache);
	}
	return cache;
}

export async function getBackgroundImage(
	loadSource: ContentSourceLoader = getContentSource,
): Promise<ImageType> {
	const source = await loadSource();
	if (source.kind === "fixture") {
		return source.content.backgroundImage;
	}

	const aboutEntry = parseExactContentfulEntry(
		await source.client.getEntries<AboutSkeleton>({
			content_type: "about",
			limit: 1,
			select: ["fields.background"],
		}),
		"Background image query",
	);
	return formatImage(
		requireContentfulAsset(
			aboutEntry.fields.background,
			"About background image",
		),
	);
}

export async function getSocialMedia(
	loadSource: ContentSourceLoader = getContentSource,
): Promise<SocialMedia[]> {
	const source = await loadSource();
	if (source.kind === "fixture") {
		return source.content.socialMedia;
	}

	return getSocialMediaCache(source.client)(async () => {
		const socialMedia = await getAllContentfulEntries(
			(skip, limit) =>
				source.client.getEntries<SocialMediaSkeleton>({
					content_type: "socialMedia",
					limit,
					skip,
				}),
			"Social media query",
		);
		return socialMedia.map((item) => {
			const { link, title } = item.fields;
			if (!isIconType(title)) {
				throw new Error(`Social media entry ${item.sys.id} is malformed.`);
			}
			return {
				id: item.sys.id,
				title,
				link: parseSocialMediaLink(title, link),
			};
		});
	});
}

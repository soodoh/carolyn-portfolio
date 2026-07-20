import type { EntriesQueries, EntrySkeletonType } from "contentful";
import {
	type ContentfulFixture,
	parseContentfulFixture,
} from "@/lib/contentful-fixture-types";
import {
	getContentfulClient,
	getContentfulPlaceholder,
} from "@/lib/contentful-utils";
import { decodeImage } from "@/lib/image-type";

export type ContentfulDeliveryClient = {
	getEntries<EntrySkeleton extends EntrySkeletonType>(
		query?: EntriesQueries<EntrySkeleton, undefined>,
	): Promise<unknown>;
	getAsset(assetId: string): Promise<unknown>;
};

export type ContentSource =
	| { kind: "fixture"; content: ContentfulFixture }
	| { kind: "live"; client: ContentfulDeliveryClient };

export type ContentSourceLoader = () => Promise<ContentSource>;

function replaceFixtureImageUrls(value: unknown): unknown {
	const image = decodeImage(value);
	if (image) {
		const url = `https://images.ctfassets.net/hermetic-build/${image.id}/fixture.jpg`;
		return {
			...image,
			url,
			placeholder: getContentfulPlaceholder(url),
		};
	}
	if (Array.isArray(value)) {
		return value.map(replaceFixtureImageUrls);
	}
	if (typeof value === "object" && value !== null) {
		return Object.fromEntries(
			Object.entries(value).map(([key, nested]) => [
				key,
				replaceFixtureImageUrls(nested),
			]),
		);
	}
	return value;
}

export function createLiveShapedFixture(
	fixture: ContentfulFixture,
): ContentfulFixture {
	return parseContentfulFixture(replaceFixtureImageUrls(fixture));
}

export async function getContentSource(): Promise<ContentSource> {
	if (process.env.PLAYWRIGHT_TEST === "true") {
		const { contentfulFixture } = await import("@/tests/fixtures/contentful");
		return {
			kind: "fixture",
			content:
				process.env.HERMETIC_PRODUCTION_BUILD === "true"
					? createLiveShapedFixture(contentfulFixture)
					: contentfulFixture,
		};
	}
	return { kind: "live", client: await getContentfulClient() };
}

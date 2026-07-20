import { afterAll, describe, expect, test } from "bun:test";
import type { Asset as ContentfulAsset } from "contentful";
import { createLiveShapedFixture } from "@/lib/content-source";
import {
	formatUrl,
	getAllContentfulEntries,
	getContentfulAssetId,
	getContentfulClient,
	getContentfulPlaceholder,
	getImageAssetFromRichTextNode,
	parseExactContentfulEntry,
} from "@/lib/contentful-utils";
import { validateResumeUrl } from "@/lib/fetch-about-data";
import { createSocialMediaCache } from "@/lib/fetch-home-data";
import { loadInitialPhotographyData } from "@/lib/fetch-photos";
import {
	filterProjectsToRelease,
	normalizeVideoLink,
} from "@/lib/fetch-projects";
import { decodeImage, isImagePlaceholder } from "@/lib/image-type";
import type { SocialMedia } from "@/lib/types";
import { contentfulFixture } from "@/tests/fixtures/contentful";

const originalEnvironment = {
	contentfulAccessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
	contentfulSpaceId: process.env.CONTENTFUL_SPACE_ID,
	playwrightTest: process.env.PLAYWRIGHT_TEST,
};

function restoreEnvironmentValue(
	name: string,
	value: string | undefined,
): void {
	if (value === undefined) {
		delete process.env[name];
	} else {
		process.env[name] = value;
	}
}

function createContentfulImageAsset(id: string): ContentfulAsset<undefined> {
	return {
		sys: {
			type: "Asset",
			id,
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-01T00:00:00.000Z",
			revision: 1,
			publishedVersion: 1,
			space: { sys: { type: "Link", linkType: "Space", id: "space" } },
			environment: {
				sys: { type: "Link", linkType: "Environment", id: "master" },
			},
		},
		metadata: { tags: [] },
		fields: {
			title: "CMS title",
			description: "CMS description",
			file: {
				url: `//images.ctfassets.net/space/${id}/version/image.jpg`,
				fileName: "image.jpg",
				contentType: "image/jpeg",
				details: { size: 100, image: { width: 800, height: 600 } },
			},
		},
	};
}

function restoreEnvironment(): void {
	restoreEnvironmentValue(
		"CONTENTFUL_ACCESS_TOKEN",
		originalEnvironment.contentfulAccessToken,
	);
	restoreEnvironmentValue(
		"CONTENTFUL_SPACE_ID",
		originalEnvironment.contentfulSpaceId,
	);
	restoreEnvironmentValue(
		"PLAYWRIGHT_TEST",
		originalEnvironment.playwrightTest,
	);
}

afterAll(() => {
	restoreEnvironment();
});

describe("Contentful boundaries", () => {
	test("evicts a rejected Contentful client initialization", async () => {
		delete process.env.CONTENTFUL_SPACE_ID;
		process.env.CONTENTFUL_ACCESS_TOKEN = "unit-test-token";
		await expect(getContentfulClient()).rejects.toThrow(
			"Missing CONTENTFUL_SPACE_ID",
		);

		process.env.CONTENTFUL_SPACE_ID = "unit-test-space";
		const first = getContentfulClient();
		const second = getContentfulClient();
		expect(first).toBe(second);
		expect(await first).toBe(await second);
	});

	test("rejects pagination total drift", async () => {
		for (const pages of [
			[
				{ items: [{ sys: { id: "first" }, fields: {} }], total: 3 },
				{ items: [{ sys: { id: "second" }, fields: {} }], total: 2 },
			],
			[
				{ items: [{ sys: { id: "first" }, fields: {} }], total: 2 },
				{ items: [{ sys: { id: "second" }, fields: {} }], total: 3 },
			],
		]) {
			let pageIndex = 0;
			await expect(
				getAllContentfulEntries(
					async () => pages[pageIndex++],
					"Drifting query",
				),
			).rejects.toThrow("inconsistent total");
		}
	});

	test("rejects duplicate entry IDs across pages", async () => {
		const pages = [
			{ items: [{ sys: { id: "same" }, fields: {} }], total: 2 },
			{ items: [{ sys: { id: "same" }, fields: {} }], total: 2 },
		];
		let pageIndex = 0;
		await expect(
			getAllContentfulEntries(
				async () => pages[pageIndex++],
				"Duplicate query",
			),
		).rejects.toThrow("duplicate entry ID same");
	});

	test("requires exact singleton Contentful responses", () => {
		const singleton = { sys: { id: "singleton" }, fields: {} };
		expect(
			parseExactContentfulEntry(
				{ items: [singleton], total: 1 },
				"Singleton query",
			),
		).toEqual(singleton);
		for (const response of [
			{ items: [], total: 0 },
			{ items: [singleton], total: 2 },
			{ items: [], total: 1 },
		]) {
			expect(() =>
				parseExactContentfulEntry(response, "Singleton query"),
			).toThrow("did not return exactly one entry");
		}
	});

	test("normalizes only HTTPS asset URLs", () => {
		expect(formatUrl("//images.ctfassets.net/image.jpg")).toBe(
			"https://images.ctfassets.net/image.jpg",
		);
		expect(formatUrl("https://images.ctfassets.net/image.jpg")).toBe(
			"https://images.ctfassets.net/image.jpg",
		);
		expect(() => formatUrl("")).toThrow("missing a URL");
		expect(() => formatUrl("http://images.ctfassets.net/image.jpg")).toThrow(
			"must use HTTPS",
		);
	});

	test("builds CDN placeholders without fetching image bodies", () => {
		expect(
			getContentfulPlaceholder(
				"https://images.ctfassets.net/image.jpg?token=keep",
			),
		).toBe(
			"https://images.ctfassets.net/image.jpg?token=keep&w=25&q=30&fm=jpg",
		);
	});

	test("decodes local and Contentful image placeholders consistently", () => {
		expect(isImagePlaceholder("data:image/jpg;base64,YQ==")).toBe(true);
		expect(
			isImagePlaceholder("https://images.ctfassets.net/image.jpg?w=25"),
		).toBe(true);
		expect(isImagePlaceholder("https://example.com/image.jpg")).toBe(false);
		expect(
			decodeImage({
				id: "image",
				title: "Image",
				description: "Description",
				url: "/test-assets/image.jpg",
				width: 1,
				height: 1,
				placeholder: "data:image/jpg;base64,YQ==",
			}),
		).toBeDefined();
	});

	test("rejects malformed image dimensions", () => {
		for (const dimension of [
			0,
			-1,
			1.5,
			Number.NaN,
			Number.POSITIVE_INFINITY,
		]) {
			expect(
				decodeImage({
					id: "image",
					title: "Image",
					description: "Description",
					url: "/test-assets/image.jpg",
					width: dimension,
					height: 1,
					placeholder: "data:image/jpg;base64,YQ==",
				}),
				String(dimension),
			).toBeUndefined();
			expect(
				decodeImage({
					id: "image",
					title: "Image",
					description: "Description",
					url: "/test-assets/image.jpg",
					width: 1,
					height: dimension,
					placeholder: "data:image/jpg;base64,YQ==",
				}),
				String(dimension),
			).toBeUndefined();
		}
	});

	test("restricts Contentful URLs to standard HTTPS authority", () => {
		expect(
			isImagePlaceholder("https://images.ctfassets.net/image.jpg?w=25"),
		).toBe(true);
		for (const url of [
			"https://user:pass@images.ctfassets.net/image.jpg?w=25",
			"https://images.ctfassets.net:8443/image.jpg?w=25",
		]) {
			expect(isImagePlaceholder(url), url).toBe(false);
		}
	});

	test("restricts resume redirects to Contentful HTTPS assets", () => {
		expect(
			validateResumeUrl("https://assets.ctfassets.net/space/resume.pdf"),
		).toBe("https://assets.ctfassets.net/space/resume.pdf");
		for (const url of [
			"https://example.com/resume.pdf",
			"http://assets.ctfassets.net/space/resume.pdf",
			"https://user:pass@assets.ctfassets.net/space/resume.pdf",
			"https://assets.ctfassets.net:8443/space/resume.pdf",
		]) {
			expect(() => validateResumeUrl(url), url).toThrow("hosted on Contentful");
		}
	});

	test("filters runtime project lists to unique release-manifest slugs", () => {
		const releasedProject = contentfulFixture.projects[0];
		const postReleaseProject = {
			...contentfulFixture.projects[1],
			id: "post-release-project",
			slug: "post-release-project",
		};
		expect(
			filterProjectsToRelease(
				[releasedProject, postReleaseProject],
				(slug) => slug === releasedProject.slug,
			),
		).toEqual([releasedProject]);
		expect(() =>
			filterProjectsToRelease(
				[releasedProject, { ...releasedProject, id: "duplicate-project" }],
				() => true,
			),
		).toThrow(`Duplicate released project slug: ${releasedProject.slug}`);
	});

	test("normalizes supported YouTube and Vimeo links", () => {
		expect(normalizeVideoLink("https://youtu.be/abc_DEF-123?t=10")).toBe(
			"https://www.youtube.com/embed/abc_DEF-123",
		);
		expect(
			normalizeVideoLink("https://www.youtube.com/watch?v=abc_DEF-123"),
		).toBe("https://www.youtube.com/embed/abc_DEF-123");
		expect(
			normalizeVideoLink("https://www.youtube.com/embed/abc_DEF-123"),
		).toBe("https://www.youtube.com/embed/abc_DEF-123");
		expect(normalizeVideoLink("https://vimeo.com/123456?autoplay=1")).toBe(
			"https://player.vimeo.com/video/123456?title=0&byline=0&portrait=0",
		);
	});

	test("rejects malformed and unsupported video links", () => {
		for (const link of [
			"not a URL",
			"http://youtu.be/abc",
			"https://youtube.example.com/watch?v=abc",
			"https://example.com/embed/video",
			"https://www.youtube.com/channel/abc",
			"https://vimeo.com/not-a-video",
		]) {
			expect(normalizeVideoLink(link), link).toBeUndefined();
		}
	});

	test("loads and caches rich-text images while keeping per-call alt text", async () => {
		const asset = createContentfulImageAsset("rich-text-cache-test");
		let loads = 0;
		const loadAsset = async (assetId: string) => {
			loads += 1;
			expect(assetId).toBe("rich-text-cache-test");
			return asset;
		};
		const url =
			"https://images.ctfassets.net/space/rich-text-cache-test/version/image.jpg";
		const [first, second] = await Promise.all([
			getImageAssetFromRichTextNode(loadAsset, url, "First alt"),
			getImageAssetFromRichTextNode(loadAsset, url, "Second alt"),
		]);

		expect(loads).toBe(1);
		expect(first).toMatchObject({
			id: "rich-text-cache-test",
			title: "First alt",
			description: "First alt",
			width: 800,
			height: 600,
		});
		expect(second.title).toBe("Second alt");
		expect(second.description).toBe("Second alt");
	});

	test("isolates rich-text image caches by asset loader", async () => {
		const url =
			"https://images.ctfassets.net/space/rich-text-source-isolation/version/image.jpg";
		let firstLoads = 0;
		let secondLoads = 0;
		const firstLoader = async () => {
			firstLoads += 1;
			return createContentfulImageAsset("first-rich-text-source");
		};
		const secondLoader = async () => {
			secondLoads += 1;
			return createContentfulImageAsset("second-rich-text-source");
		};

		const first = await getImageAssetFromRichTextNode(
			firstLoader,
			url,
			"First source",
		);
		const second = await getImageAssetFromRichTextNode(
			secondLoader,
			url,
			"Second source",
		);

		expect(first.id).toBe("first-rich-text-source");
		expect(second.id).toBe("second-rich-text-source");
		expect(firstLoads).toBe(1);
		expect(secondLoads).toBe(1);
	});

	test("retries rich-text image loading after rejection", async () => {
		const asset = createContentfulImageAsset("rich-text-retry-test");
		let loads = 0;
		const loadAsset = async () => {
			loads += 1;
			if (loads === 1) {
				throw new Error("temporary Contentful failure");
			}
			return asset;
		};
		const url =
			"https://images.ctfassets.net/space/rich-text-retry-test/version/image.jpg";
		await expect(
			getImageAssetFromRichTextNode(loadAsset, url, "Alt"),
		).rejects.toThrow("temporary Contentful failure");
		await expect(
			getImageAssetFromRichTextNode(loadAsset, url, "Alt"),
		).resolves.toMatchObject({ id: "rich-text-retry-test" });
		expect(loads).toBe(2);
	});

	test("caches social media with expiry and rejected-promise eviction", async () => {
		const cachedLoad = createSocialMediaCache(100);
		const socialMedia: SocialMedia[] = [
			{ id: "instagram", title: "instagram", link: "https://example.com" },
		];
		let loads = 0;
		const load = async () => {
			loads += 1;
			return socialMedia;
		};
		expect(await cachedLoad(load, 0)).toBe(socialMedia);
		expect(await cachedLoad(load, 99)).toBe(socialMedia);
		expect(await cachedLoad(load, 100)).toBe(socialMedia);
		expect(loads).toBe(2);

		const retryingLoad = createSocialMediaCache(100);
		let attempts = 0;
		const retry = async () => {
			attempts += 1;
			if (attempts === 1) {
				throw new Error("temporary social failure");
			}
			return socialMedia;
		};
		await expect(retryingLoad(retry, 0)).rejects.toThrow(
			"temporary social failure",
		);
		await expect(retryingLoad(retry, 1)).resolves.toBe(socialMedia);
		expect(attempts).toBe(2);
	});

	test("creates a live-shaped hermetic fixture without local assets", () => {
		const fixture = createLiveShapedFixture(contentfulFixture);
		expect(fixture.backgroundImage.url).toStartWith(
			"https://images.ctfassets.net/hermetic-build/",
		);
		expect(fixture.backgroundImage.placeholder).toContain("w=25");
		expect(JSON.stringify(fixture)).not.toContain("/test-assets/");
	});

	test("extracts asset IDs from approved Contentful image URLs", () => {
		expect(
			getContentfulAssetId(
				"//images.ctfassets.net/space/asset-id/version/image.png",
			),
		).toBe("asset-id");
		expect(
			getContentfulAssetId(
				"https://downloads.contentful.com/space/legacy_asset/version/image.png",
			),
		).toBe("legacy_asset");
		expect(
			getContentfulAssetId(
				"https://downloads.ctfassets.net/space/download_asset/version/image.gif",
			),
		).toBe("download_asset");
		expect(
			getContentfulAssetId(
				"https://images.contentful.com/rcuybrzofove/DgiExY3V20GNhotAOkooW/dcd8a8b195022f342790c3a7b5f7af49/Motion_Design_tracker.png",
			),
		).toBe("DgiExY3V20GNhotAOkooW");
	});

	test("rejects image URLs without an approved Contentful asset ID", () => {
		expect(() =>
			getContentfulAssetId("https://example.com/space/asset/image.png"),
		).toThrow("approved HTTPS host");
		expect(() =>
			getContentfulAssetId("https://images.ctfassets.net/space"),
		).toThrow("valid asset ID");
	});

	test("derives ordered initial photography data from one album snapshot", async () => {
		let loads = 0;
		const initial = await loadInitialPhotographyData(async () => {
			loads += 1;
			return contentfulFixture.albums;
		});
		expect(loads).toBe(1);
		expect(initial.albumNames).toEqual(["Dance", "Portraits", "Spaces"]);
		expect(initial.initialAlbum.name).toBe("Dance");
		expect(initial.initialAlbum).toBe(contentfulFixture.albums[0]);
	});

	test("rejects empty and malformed initial photography snapshots", async () => {
		await expect(loadInitialPhotographyData(async () => [])).rejects.toThrow(
			"No photography albums",
		);
		await expect(
			loadInitialPhotographyData(async () => [
				{ name: "", photos: contentfulFixture.albums[0].photos },
			]),
		).rejects.toThrow("Album name is malformed");
		await expect(
			loadInitialPhotographyData(async () => [
				{ name: " Dance", photos: contentfulFixture.albums[0].photos },
			]),
		).rejects.toThrow("Album name is malformed");
		await expect(
			loadInitialPhotographyData(async () => [
				contentfulFixture.albums[0],
				contentfulFixture.albums[0],
			]),
		).rejects.toThrow("Duplicate photography album name: Dance");
	});
});

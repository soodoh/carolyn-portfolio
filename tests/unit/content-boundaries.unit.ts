import { afterAll, describe, expect, test } from "bun:test";
import sharp from "sharp";
import {
	formatUrl,
	getContentfulPlaceholder,
	getImageAssetFromRichTextNode,
} from "@/lib/contentful-utils";
import { validateResumeUrl } from "@/lib/fetch-about-data";
import { normalizeVideoLink } from "@/lib/fetch-projects";

const originalFetch = globalThis.fetch;

afterAll(() => {
	globalThis.fetch = originalFetch;
});

describe("Contentful boundaries", () => {
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

	test("restricts resume redirects to Contentful HTTPS assets", () => {
		expect(
			validateResumeUrl("https://assets.ctfassets.net/space/resume.pdf"),
		).toBe("https://assets.ctfassets.net/space/resume.pdf");
		expect(() => validateResumeUrl("https://example.com/resume.pdf")).toThrow(
			"hosted on Contentful",
		);
		expect(() =>
			validateResumeUrl("http://assets.ctfassets.net/space/resume.pdf"),
		).toThrow("hosted on Contentful");
	});

	test("normalizes supported YouTube and Vimeo links", () => {
		expect(normalizeVideoLink("https://youtu.be/abc_DEF-123?t=10")).toBe(
			"https://www.youtube.com/embed/abc_DEF-123",
		);
		expect(
			normalizeVideoLink("https://www.youtube.com/watch?v=abc_DEF-123"),
		).toBe("https://www.youtube.com/embed/abc_DEF-123");
		expect(normalizeVideoLink("https://vimeo.com/123456?autoplay=1")).toBe(
			"https://player.vimeo.com/video/123456?title=0&byline=0&portrait=0",
		);
	});

	test("deduplicates concurrent rich-text image downloads", async () => {
		let requestCount = 0;
		const png = await sharp({
			create: {
				width: 1,
				height: 1,
				channels: 3,
				background: "white",
			},
		})
			.png()
			.toBuffer();
		globalThis.fetch = async () => {
			requestCount += 1;
			return new Response(png, { status: 200 });
		};

		const url = "//images.ctfassets.net/test/concurrent-image.png";
		const [first, second] = await Promise.all([
			getImageAssetFromRichTextNode(url, "First context"),
			getImageAssetFromRichTextNode(url, "Second context"),
		]);

		expect(requestCount).toBe(1);
		expect(first.title).toBe("First context");
		expect(second.title).toBe("Second context");
		expect(first.placeholder).toBe(second.placeholder);
		expect(first.width).toBe(1);
		expect(first.height).toBe(1);
	});
});

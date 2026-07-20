import { describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { parseContentfulFixture } from "@/lib/contentful-fixture-types";
import { normalizeVideoLink } from "@/lib/fetch-projects";
import { decodeImage } from "@/lib/image-type";
import manifest from "@/lib/project-auth-manifest.json";
import type { IconType, ImageType } from "@/lib/types";
import { contentfulFixture } from "@/tests/fixtures/contentful";
import rawFixture from "@/tests/fixtures/contentful.json";

const authBySlug = new Map(Object.entries(manifest));

function collectImages(value: unknown, images: ImageType[]): void {
	const image = decodeImage(value);
	if (image) {
		images.push(image);
		return;
	}
	if (Array.isArray(value)) {
		for (const item of value) {
			collectImages(item, images);
		}
		return;
	}
	if (typeof value === "object" && value !== null) {
		for (const nested of Object.values(value)) {
			collectImages(nested, images);
		}
	}
}

function expectUnique(values: string[]): void {
	expect(new Set(values).size).toBe(values.length);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function replaceFirstDocumentImageUrl(value: unknown, url: string): boolean {
	if (Array.isArray(value)) {
		return value.some((item) => replaceFirstDocumentImageUrl(item, url));
	}
	if (!isRecord(value)) {
		return false;
	}
	if ("image" in value && isRecord(value.image) && decodeImage(value.image)) {
		value.image.url = url;
		return true;
	}
	return Object.values(value).some((nested) =>
		replaceFirstDocumentImageUrl(nested, url),
	);
}

describe("Contentful fixture contract", () => {
	test("rejects malformed fixture JSON at runtime", () => {
		expect(() => parseContentfulFixture({ projects: [] })).toThrow(
			"runtime contract",
		);
		expect(() => parseContentfulFixture(rawFixture)).not.toThrow();
	});

	test("requires social links to match their declared HTTPS hosts", () => {
		const validFixture = structuredClone(contentfulFixture);
		validFixture.socialMedia = [
			{
				id: "instagram",
				title: "instagram",
				link: "https://www.instagram.com/example/",
			},
			{
				id: "linkedin",
				title: "linkedin",
				link: "https://uk.linkedin.com/in/example/",
			},
		];
		expect(() => parseContentfulFixture(validFixture)).not.toThrow();

		const invalidLinks = [
			{ title: "instagram", link: "https://linkedin.com/in/example" },
			{ title: "linkedin", link: "https://instagram.com/example" },
			{ title: "instagram", link: "http://instagram.com/example" },
			{ title: "linkedin", link: "https://user@linkedin.com/in/example" },
			{ title: "instagram", link: "https://instagram.com:8443/example" },
			{ title: "linkedin", link: "not-a-url" },
		] satisfies { title: IconType; link: string }[];
		for (const { title, link } of invalidLinks) {
			const fixture = structuredClone(contentfulFixture);
			fixture.socialMedia = [{ id: "invalid-social", title, link }];
			expect(() => parseContentfulFixture(fixture)).toThrow(
				"Social media link",
			);
		}
	});

	test("accepts only checked-in or approved remote fixture image URLs", () => {
		const approvedRemote = structuredClone(contentfulFixture);
		approvedRemote.backgroundImage.url =
			"https://images.ctfassets.net/space/background/version/image.jpg";
		expect(() => parseContentfulFixture(approvedRemote)).not.toThrow();

		const invalidFixtures = [
			() => {
				const fixture = structuredClone(contentfulFixture);
				fixture.backgroundImage.url = "https://example.com/background.jpg";
				return fixture;
			},
			() => {
				const fixture = structuredClone(contentfulFixture);
				fixture.about.profilePicture.url =
					"http://images.ctfassets.net/profile.jpg";
				return fixture;
			},
			() => {
				const fixture = structuredClone(contentfulFixture);
				fixture.projects[0].coverImage.url = "/test-assets/../secret.jpg";
				return fixture;
			},
			() => {
				const fixture = structuredClone(contentfulFixture);
				fixture.albums[0].photos[0].url = "//images.ctfassets.net/photo.jpg";
				return fixture;
			},
			() => {
				const fixture = structuredClone(contentfulFixture);
				const replaced = replaceFirstDocumentImageUrl(
					Object.values(fixture.projectInfo)[0].description,
					"https://example.com/detail.jpg",
				);
				expect(replaced).toBe(true);
				return fixture;
			},
		];
		for (const createFixture of invalidFixtures) {
			expect(() => parseContentfulFixture(createFixture())).toThrow(
				"approved source",
			);
		}
	});

	test("enforces valid unique fixture album names", () => {
		for (const name of ["", " Dance", "Dance ", "x".repeat(101)]) {
			const fixture = structuredClone(contentfulFixture);
			fixture.albums[0].name = name;
			expect(() => parseContentfulFixture(fixture)).toThrow(
				"Album name is malformed",
			);
		}
		const duplicate = structuredClone(contentfulFixture);
		duplicate.albums[1].name = duplicate.albums[0].name;
		expect(() => parseContentfulFixture(duplicate)).toThrow(
			"Duplicate photography album name: Dance",
		);
	});

	test("keeps project, detail, and auth records in exact correspondence", () => {
		const projectSlugs = contentfulFixture.projects.map(
			(project) => project.slug,
		);
		expectUnique(projectSlugs);
		expectUnique(contentfulFixture.projects.map((project) => project.id));
		expect(Object.keys(contentfulFixture.projectInfo).sort()).toEqual(
			[...projectSlugs].sort(),
		);
		expect(Object.keys(manifest).sort()).toEqual([...projectSlugs].sort());
		for (const project of contentfulFixture.projects) {
			const detail = contentfulFixture.projectInfo[project.slug];
			expect(detail.id).toBe(project.id);
			expect(detail.slug).toBe(project.slug);
			expect(Boolean(detail.password)).toBe(
				Boolean(authBySlug.get(project.slug)?.passwordHash),
			);
		}
	});

	test("references every local visual asset exactly through supported content", async () => {
		const images: ImageType[] = [];
		collectImages(contentfulFixture, images);
		const imageUrls = new Map<string, string>();
		for (const image of images) {
			expect(image.url).toMatch(/^\/test-assets\/[A-Za-z0-9_-]+\.jpg$/);
			expect(image.placeholder).toStartWith("data:image/");
			const existingUrl = imageUrls.get(image.id);
			if (existingUrl) {
				expect(image.url).toBe(existingUrl);
			} else {
				imageUrls.set(image.id, image.url);
			}
		}

		const referencedFiles = new Set(
			[...imageUrls.values()].map((url) => url.replace("/test-assets/", "")),
		);
		const assetFiles = new Set(
			(
				await readdir(new URL("../../public/test-assets/", import.meta.url))
			).filter((name) => !name.startsWith(".")),
		);
		expect([...assetFiles].sort()).toEqual([...referencedFiles].sort());
	});

	test("contains only canonical supported video embeds", () => {
		for (const project of Object.values(contentfulFixture.projectInfo)) {
			if (project.videoLink) {
				expect(normalizeVideoLink(project.videoLink)).toBe(project.videoLink);
			}
		}
	});
});

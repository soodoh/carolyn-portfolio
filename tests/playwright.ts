import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { APIResponse, Route } from "@playwright/test";
import { test as base, expect } from "@playwright/test";
import { parseContentfulFixture } from "@/lib/contentful-fixture-types";
import { decodeImage } from "@/lib/image-type";

function collectFixtureImagePaths(
	value: unknown,
	paths = new Map<string, string>(),
): Map<string, string> {
	const image = decodeImage(value);
	if (image) {
		if (!image.url.startsWith("/test-assets/")) {
			throw new Error(`Fixture image ${image.id} is not a local test asset.`);
		}
		const imagePath = resolve("public", `.${image.url}`);
		const existingPath = paths.get(image.id);
		if (existingPath && existingPath !== imagePath) {
			throw new Error(`Fixture image ${image.id} maps to multiple files.`);
		}
		paths.set(image.id, imagePath);
		return paths;
	}
	if (Array.isArray(value)) {
		for (const item of value) {
			collectFixtureImagePaths(item, paths);
		}
		return paths;
	}
	if (typeof value === "object" && value !== null) {
		for (const item of Object.values(value)) {
			collectFixtureImagePaths(item, paths);
		}
	}
	return paths;
}

const contentfulFixture = parseContentfulFixture(
	JSON.parse(readFileSync(resolve("tests/fixtures/contentful.json"), "utf8")),
);
const fixtureImagePaths = collectFixtureImagePaths(contentfulFixture);
const hermeticImagePath = /^\/hermetic-build\/(.+)\/fixture\.jpg$/;

export async function fetchRoutedResponse(route: Route): Promise<APIResponse> {
	return route.fetch({
		headers: {
			...(await route.request().allHeaders()),
			"sec-fetch-site": "same-origin",
		},
	});
}

export const test = base.extend({
	context: async ({ context }, use) => {
		if (process.env.HERMETIC_ARTIFACT_TEST === "true") {
			await context.route(
				"https://images.ctfassets.net/hermetic-build/**",
				async (route) => {
					const imageId = new URL(route.request().url()).pathname.match(
						hermeticImagePath,
					)?.[1];
					const imagePath = imageId
						? fixtureImagePaths.get(imageId)
						: undefined;
					if (!imagePath) {
						await route.abort("failed");
						return;
					}
					await route.fulfill({ path: imagePath });
				},
			);
		}
		await use(context);
	},
});

export { expect };

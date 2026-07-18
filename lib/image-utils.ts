import sharp, { type Sharp } from "sharp";
import type { ImagePlaceholder } from "./types";

const IMAGE_FETCH_TIMEOUT_MS = 10_000;

function getOptimizedImageUrl(baseUrl: string): URL {
	const url = new URL(baseUrl);
	url.searchParams.set("w", "100");
	url.searchParams.set("q", "50");
	url.searchParams.set("fm", "jpg");
	return url;
}

export async function readImage(baseUrl: string): Promise<Sharp> {
	const url = getOptimizedImageUrl(baseUrl);
	const response = await fetch(url, {
		signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
	});
	if (!response.ok) {
		throw new Error(`Unable to fetch image ${url}: ${response.status}`);
	}
	return sharp(await response.arrayBuffer()).jpeg();
}

async function createPlaceholder(image: Sharp): Promise<ImagePlaceholder> {
	const imageBuffer = await image.resize(25).blur().toBuffer();
	return `data:image/jpg;base64,${imageBuffer.toString("base64")}`;
}

export async function getPlaceholder(url: string): Promise<ImagePlaceholder> {
	return createPlaceholder(await readImage(url));
}

export async function getImageMetadataAndPlaceholder(url: string): Promise<{
	width: number;
	height: number;
	placeholder: ImagePlaceholder;
}> {
	const image = await readImage(url);
	const [metadata, placeholder] = await Promise.all([
		image.clone().metadata(),
		createPlaceholder(image.clone()),
	]);
	if (!metadata.width || !metadata.height) {
		throw new Error(`Image is missing dimensions: ${url}`);
	}
	return { width: metadata.width, height: metadata.height, placeholder };
}

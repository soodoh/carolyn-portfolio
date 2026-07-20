import { isContentfulImageUrl } from "@/lib/contentful-url-policy";
import type { ImagePlaceholder, ImageType } from "@/lib/types";

export function isPositiveSafeInteger(value: unknown): value is number {
	return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export function isImagePlaceholder(value: unknown): value is ImagePlaceholder {
	return (
		typeof value === "string" &&
		(value.startsWith("data:image/") || isContentfulImageUrl(value))
	);
}

export function decodeImage(value: unknown): ImageType | undefined {
	if (
		typeof value !== "object" ||
		value === null ||
		!("id" in value) ||
		typeof value.id !== "string" ||
		!("title" in value) ||
		typeof value.title !== "string" ||
		!("description" in value) ||
		typeof value.description !== "string" ||
		!("url" in value) ||
		typeof value.url !== "string" ||
		!("width" in value) ||
		!isPositiveSafeInteger(value.width) ||
		!("height" in value) ||
		!isPositiveSafeInteger(value.height) ||
		!("placeholder" in value) ||
		!isImagePlaceholder(value.placeholder)
	) {
		return undefined;
	}
	return {
		id: value.id,
		title: value.title,
		description: value.description,
		url: value.url,
		width: value.width,
		height: value.height,
		placeholder: value.placeholder,
	};
}

import { describe, expect, test } from "bun:test";
import {
	GALLERY_CHROME_HEIGHT_PX,
	getModalImageSizes,
} from "@/components/modal-image";
import type { ImageType } from "@/lib/types";

function image(width: number, height: number): ImageType {
	return {
		id: `${width}-${height}`,
		title: "Image",
		description: "Image",
		url: "/test-assets/image.jpg",
		width,
		height,
		placeholder: "data:image/jpg;base64,YQ==",
	};
}

describe("modal image sizes", () => {
	test("retains viewport-width sizing for landscape images", () => {
		expect(getModalImageSizes(image(1920, 1280))).toBe("100vw");
		expect(getModalImageSizes(image(1000, 1000))).toBe("100vw");
	});

	test("advertises the aspect-constrained portrait width", () => {
		expect(GALLERY_CHROME_HEIGHT_PX).toBe(40);
		expect(getModalImageSizes(image(2, 3))).toBe(
			"min(100vw, calc(66.6667vh - 26.6667px))",
		);
	});
});

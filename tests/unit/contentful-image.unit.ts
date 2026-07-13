import { describe, expect, test } from "bun:test";
import { transformContentfulImage } from "@/components/image-wrapper";

describe("Contentful image transformer", () => {
	test("caps widths and preserves existing URL parameters", () => {
		expect(
			transformContentfulImage("/image.jpg?token=keep#preview", {
				width: 5000,
				quality: 80,
				format: "webp",
			}),
		).toBe("/image.jpg?token=keep&w=4000&q=80&fm=webp#preview");

		expect(
			transformContentfulImage(
				"https://images.ctfassets.net/image.jpg?fit=pad",
				{
					width: 3840,
					quality: 50,
					format: "webp",
				},
			),
		).toBe(
			"https://images.ctfassets.net/image.jpg?fit=pad&w=3840&q=50&fm=webp",
		);
	});
});

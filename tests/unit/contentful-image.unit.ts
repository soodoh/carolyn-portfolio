import { describe, expect, mock, test } from "bun:test";
import { isValidElement } from "react";
import ImageWrapper, {
	getImageBreakpoints,
	shouldUseImagePlaceholder,
	transformContentfulImage,
} from "@/components/image-wrapper";

describe("Contentful image transformer", () => {
	test("keeps one component type when remote placeholder priority changes", () => {
		expect(
			shouldUseImagePlaceholder(
				"https://images.ctfassets.net/image.jpg?w=25&q=30&fm=jpg",
				false,
			),
		).toBe(false);
		expect(shouldUseImagePlaceholder("data:image/jpg;base64,YQ==", false)).toBe(
			true,
		);
		expect(
			shouldUseImagePlaceholder(
				"https://images.ctfassets.net/image.jpg?w=25&q=30&fm=jpg",
				true,
			),
		).toBe(true);

		const onLoad = mock(() => {});
		const image = {
			id: "remote-image",
			title: "Remote image",
			description: "Remote image",
			url: "https://images.ctfassets.net/space/remote/image.jpg",
			width: 800,
			height: 600,
			placeholder:
				"https://images.ctfassets.net/space/remote/image.jpg?w=25&q=30&fm=jpg",
		};
		const element = ImageWrapper({ image, onLoad });
		const priorityElement = ImageWrapper({ image, onLoad, priority: true });
		expect(element.type).toBe(priorityElement.type);
		if (!isValidElement<{ onLoad?: () => void }>(element)) {
			throw new Error("ImageWrapper did not return a React element.");
		}
		expect(element.props.onLoad).toBe(onLoad);
		element.props.onLoad?.();
		expect(onLoad).toHaveBeenCalledTimes(1);
	});

	test("caps responsive candidates at each image's intrinsic width", () => {
		expect(getImageBreakpoints([32, 64, 128, 256, 3840], 100)).toEqual([
			32, 64, 100,
		]);
		expect(getImageBreakpoints([32, 64, 128], 128)).toEqual([32, 64, 128]);
		expect(getImageBreakpoints([128, 3840], 5000)).toEqual([128, 3840, 4000]);
	});

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

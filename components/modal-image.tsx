import type { JSX } from "react";
import ImageWrapper from "@/components/image-wrapper";
import type { ImageType } from "@/lib/types";

type Props = {
	image: ImageType;
	priority?: boolean;
};

export const GALLERY_CHROME_HEIGHT_PX = 40;

export function getModalImageSizes(image: ImageType): string {
	if (image.width >= image.height) {
		return "100vw";
	}
	const aspectRatio = image.width / image.height;
	const viewportHeightPercent = (aspectRatio * 100).toFixed(4);
	const chromeWidth = (aspectRatio * GALLERY_CHROME_HEIGHT_PX).toFixed(4);
	return `min(100vw, calc(${viewportHeightPercent}vh - ${chromeWidth}px))`;
}

const ModalImage = ({ image, priority = false }: Props): JSX.Element => {
	return (
		<ImageWrapper
			alt={image.description || image.title}
			className="w-full h-full object-contain"
			priority={priority}
			placeholderFit="contain"
			image={image}
			sizes={getModalImageSizes(image)}
		/>
	);
};

export default ModalImage;

import type { JSX } from "react";
import ImageWrapper from "@/components/image-wrapper";
import type { ImageType } from "@/lib/types";

type Props = {
	image: ImageType;
	priority?: boolean;
};

const ModalImage = ({ image, priority = false }: Props): JSX.Element => {
	return (
		<ImageWrapper
			alt={image.description || image.title}
			className="w-full h-full object-contain"
			priority={priority}
			placeholderFit="contain"
			image={image}
			sizes="100vw"
		/>
	);
};

export default ModalImage;

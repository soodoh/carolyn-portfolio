import type { JSX } from "react";
import ImageWrapper from "@/components/image-wrapper";
import type { ImageType } from "@/lib/types";

type Props = {
	image: ImageType;
};

const ModalImage = ({ image }: Props): JSX.Element => {
	return (
		<ImageWrapper
			className="w-full h-full object-contain"
			priority
			placeholderFit="contain"
			image={image}
			sizes="100vw"
		/>
	);
};

export default ModalImage;

import { Image, type ImageProps } from "@unpic/react/base";
import { type CSSProperties, type JSX, useState } from "react";
import type { ContentfulOperations } from "unpic/providers/contentful";
import type { ImageType } from "@/lib/types";

type TransformerOptions = {
	sourceWidth: number;
};

type StyledImageProps = ImageProps<ContentfulOperations, TransformerOptions> & {
	style?: CSSProperties;
};

function StyledImage(props: StyledImageProps): JSX.Element {
	return <Image {...props} />;
}

function transformContentfulImage(
	src: string | URL,
	operations: ContentfulOperations,
	options?: TransformerOptions,
): string {
	const url = src.toString();
	const width =
		operations.width === options?.sourceWidth ? 3840 : operations.width;
	const searchParams = new URLSearchParams();
	if (width) {
		searchParams.set("w", String(width));
	}
	if (operations.quality) {
		searchParams.set("q", String(operations.quality));
	}
	searchParams.set("fm", String(operations.format ?? "webp"));
	if (url.startsWith("/")) {
		return `${url}?${searchParams.toString()}`;
	}
	const transformedUrl = new URL(url);
	for (const [name, value] of searchParams) {
		transformedUrl.searchParams.set(name, value);
	}
	return transformedUrl.toString();
}

type Props = {
	image: ImageType;
	quality?: number;
	priority?: boolean;
	sizes?: string;
	className?: string;
	onLoad?: () => void;
	placeholderFit?: "contain" | "cover";
};

const ImageWrapper = ({
	image,
	quality = 100,
	priority = false,
	className,
	onLoad,
	placeholderFit = "cover",
	sizes = [
		"(max-width: 399px) 184px",
		"(max-width: 519px) 244px",
		"(max-width: 639px) 200px",
		"(max-width: 767px) 156px",
		"(max-width: 1023px) 220px",
		"(max-width: 1279px) 280px",
		"280px",
	].join(", "),
}: Props): JSX.Element => {
	const [loaded, setLoaded] = useState(false);

	return (
		<StyledImage
			className={className ?? "w-full h-auto object-contain"}
			data-nimg="1"
			priority={priority || image.url.startsWith("/test-assets/")}
			layout="fixed"
			unstyled
			width={image.width}
			height={image.height}
			alt={image.description}
			breakpoints={[
				32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048,
				3840,
			]}
			sizes={sizes}
			src={image.url}
			transformer={transformContentfulImage}
			operations={{ quality, format: "webp" }}
			options={{ sourceWidth: image.width }}
			style={{
				color: "transparent",
				backgroundImage: loaded ? undefined : `url(${image.placeholder})`,
				backgroundPosition: loaded ? undefined : "center",
				backgroundRepeat: loaded ? undefined : "no-repeat",
				backgroundSize: loaded ? undefined : placeholderFit,
			}}
			onLoad={() => {
				setLoaded(true);
				onLoad?.();
			}}
		/>
	);
};

export default ImageWrapper;

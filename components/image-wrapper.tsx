import { Image, type ImageProps } from "@unpic/react/base";
import {
	type CSSProperties,
	type JSX,
	type Ref,
	useEffect,
	useRef,
	useState,
} from "react";
import type { ContentfulOperations } from "unpic/providers/contentful";
import type { ImageType } from "@/lib/types";

const CONTENTFUL_MAX_WIDTH = 4000;
const IMAGE_BREAKPOINTS = [
	32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840,
];

type StyledImageProps = ImageProps<ContentfulOperations, undefined> & {
	ref?: Ref<HTMLImageElement>;
	style?: CSSProperties;
};

function StyledImage(props: StyledImageProps): JSX.Element {
	return <Image {...props} />;
}

export function transformContentfulImage(
	src: string | URL,
	operations: ContentfulOperations,
): string {
	const url = src.toString();
	const searchParams = new URLSearchParams();
	const requestedWidth =
		typeof operations.width === "number"
			? operations.width
			: Number.parseInt(operations.width ?? "", 10);
	if (Number.isFinite(requestedWidth)) {
		searchParams.set(
			"w",
			String(Math.min(requestedWidth, CONTENTFUL_MAX_WIDTH)),
		);
	}
	if (operations.quality) {
		searchParams.set("q", String(operations.quality));
	}
	searchParams.set("fm", String(operations.format ?? "webp"));
	if (url.startsWith("/")) {
		const transformedUrl = new URL(url, "http://localhost");
		for (const [name, value] of searchParams) {
			transformedUrl.searchParams.set(name, value);
		}
		return `${transformedUrl.pathname}${transformedUrl.search}${transformedUrl.hash}`;
	}
	const transformedUrl = new URL(url);
	for (const [name, value] of searchParams) {
		transformedUrl.searchParams.set(name, value);
	}
	return transformedUrl.toString();
}

export const MASONRY_IMAGE_BREAKPOINTS = [
	128, 256, 384, 640, 750, 828, 1080, 1200,
];
export const MASONRY_IMAGE_SIZES = [
	"(max-width: 660px) calc(100vw - 48px)",
	"(max-width: 962px) calc((100vw - 98px) / 2)",
	"(max-width: 1260px) calc((100vw - 148px) / 3)",
	"(max-width: 1488px) calc((100vw - 198px) / 4)",
	"323px",
].join(", ");

type Props = {
	image: ImageType;
	alt?: string;
	breakpoints?: number[];
	quality?: number;
	priority?: boolean;
	sizes?: string;
	className?: string;
	onLoad?: () => void;
	placeholderFit?: "contain" | "cover";
};

const ImageWrapper = ({
	image,
	alt = image.description,
	breakpoints = IMAGE_BREAKPOINTS,
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
	const imageRef = useRef<HTMLImageElement>(null);
	const [loadedUrl, setLoadedUrl] = useState<string>();
	const loaded = loadedUrl === image.url;

	useEffect(() => {
		const element = imageRef.current;
		if (element?.complete && element.naturalWidth > 0) {
			setLoadedUrl(image.url);
		}
	}, [image.url]);

	return (
		<StyledImage
			ref={imageRef}
			className={className ?? "w-full h-auto object-contain"}
			priority={priority}
			layout="fixed"
			unstyled
			width={image.width}
			height={image.height}
			alt={alt}
			breakpoints={breakpoints}
			sizes={sizes}
			src={image.url}
			transformer={transformContentfulImage}
			operations={{ quality, format: "webp" }}
			style={{
				color: "transparent",
				backgroundImage: loaded ? undefined : `url(${image.placeholder})`,
				backgroundPosition: loaded ? undefined : "center",
				backgroundRepeat: loaded ? undefined : "no-repeat",
				backgroundSize: loaded ? undefined : placeholderFit,
			}}
			onLoad={() => {
				setLoadedUrl(image.url);
				onLoad?.();
			}}
		/>
	);
};

export default ImageWrapper;

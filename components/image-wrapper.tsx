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

export function getImageBreakpoints(
	breakpoints: number[],
	intrinsicWidth: number,
): number[] {
	const terminalWidth = Math.min(intrinsicWidth, CONTENTFUL_MAX_WIDTH);
	return [
		...new Set([
			...breakpoints.filter((breakpoint) => breakpoint < terminalWidth),
			terminalWidth,
		]),
	];
}

export function shouldUseImagePlaceholder(
	placeholder: string,
	priority: boolean,
): boolean {
	return priority || placeholder.startsWith("data:image/");
}

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

type ResolvedProps = {
	image: ImageType;
	alt: string;
	breakpoints: number[];
	quality: number;
	priority: boolean;
	sizes: string;
	className?: string;
	onLoad?: () => void;
	placeholderFit: "contain" | "cover";
};

function ImageElement({
	image,
	alt,
	breakpoints,
	quality,
	priority,
	sizes,
	className,
	onLoad,
	placeholderFit,
	imageRef,
	showPlaceholder,
}: ResolvedProps & {
	imageRef?: Ref<HTMLImageElement>;
	showPlaceholder: boolean;
}): JSX.Element {
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
			breakpoints={getImageBreakpoints(breakpoints, image.width)}
			sizes={sizes}
			src={image.url}
			transformer={transformContentfulImage}
			operations={{ quality, format: "webp" }}
			style={{
				color: "transparent",
				backgroundImage: showPlaceholder
					? `url(${image.placeholder})`
					: undefined,
				backgroundPosition: showPlaceholder ? "center" : undefined,
				backgroundRepeat: showPlaceholder ? "no-repeat" : undefined,
				backgroundSize: showPlaceholder ? placeholderFit : undefined,
			}}
			onLoad={onLoad}
		/>
	);
}

function PlaceholderImage(props: ResolvedProps): JSX.Element {
	const imageRef = useRef<HTMLImageElement>(null);
	const [loadedUrl, setLoadedUrl] = useState<string>();
	const loaded = loadedUrl === props.image.url;

	useEffect(() => {
		const element = imageRef.current;
		if (element?.complete && element.naturalWidth > 0) {
			setLoadedUrl(props.image.url);
		}
	}, [props.image.url]);

	return (
		<ImageElement
			{...props}
			imageRef={imageRef}
			showPlaceholder={
				!loaded &&
				shouldUseImagePlaceholder(props.image.placeholder, props.priority)
			}
			onLoad={() => {
				setLoadedUrl(props.image.url);
				props.onLoad?.();
			}}
		/>
	);
}

const ImageWrapper = ({
	image,
	alt = image.description,
	breakpoints = IMAGE_BREAKPOINTS,
	quality = 80,
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
	const props = {
		image,
		alt,
		breakpoints,
		quality,
		priority,
		sizes,
		className,
		onLoad,
		placeholderFit,
	};
	return <PlaceholderImage {...props} />;
};

export default ImageWrapper;

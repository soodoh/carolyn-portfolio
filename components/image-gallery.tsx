"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useState } from "react";
import ModalImage from "@/components/modal-image";
import type { CarouselApi, CarouselNavigation } from "@/components/ui/carousel";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import type { ImageType } from "@/lib/types";
import { cn, darkSurfaceFocusClass } from "@/lib/utils";

type ImageGalleryProps = {
	images: ImageType[];
	initialIndex: number;
	onNavigationChange?: (navigation: CarouselNavigation) => void;
};

const ImageGallery = ({
	images,
	initialIndex,
	onNavigationChange,
}: ImageGalleryProps): JSX.Element => {
	const [api, setApi] = useState<CarouselApi>();
	const [currentIndex, setCurrentIndex] = useState(initialIndex);
	const handleApiChange = useCallback((nextApi: CarouselApi) => {
		setApi(nextApi);
	}, []);

	useEffect(() => {
		if (!api) {
			return;
		}

		const onSelect = () => {
			setCurrentIndex(api.selectedScrollSnap());
		};

		api.on("select", onSelect);
		return () => {
			api.off("select", onSelect);
		};
	}, [api]);

	return (
		<>
			<Carousel
				aria-label="Photography image gallery"
				className="flex-1 min-h-0 flex flex-col"
				opts={{ startIndex: initialIndex, watchDrag: true }}
				setApi={handleApiChange}
				setNavigation={onNavigationChange}
			>
				<CarouselContent className="h-full ml-0">
					{images.map((image, index) => (
						<CarouselItem
							key={`gallery-slide-${image.id}`}
							aria-label={`${index + 1} of ${images.length}`}
							aria-hidden={index !== currentIndex}
							className="h-full pl-0 flex justify-center"
						>
							{Math.abs(index - currentIndex) <= 1 ? (
								<ModalImage image={image} priority={index === currentIndex} />
							) : null}
						</CarouselItem>
					))}
				</CarouselContent>

				<CarouselPrevious
					variant="ghost"
					className={cn(
						darkSurfaceFocusClass,
						"left-2 top-1/2 -translate-y-1/2 size-10 max-md:size-8 border-none text-light/70 hover:text-light hover:bg-white/10 disabled:opacity-0",
					)}
				/>
				<CarouselNext
					variant="ghost"
					className={cn(
						darkSurfaceFocusClass,
						"right-2 top-1/2 -translate-y-1/2 size-10 max-md:size-8 border-none text-light/70 hover:text-light hover:bg-white/10 disabled:opacity-0",
					)}
				/>
			</Carousel>

			<div
				aria-atomic="true"
				aria-live="polite"
				className="pb-3 text-center text-light/70 text-sm"
			>
				{currentIndex + 1} / {images.length}
			</div>
		</>
	);
};

export default ImageGallery;

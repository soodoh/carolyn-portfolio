"use client";

import { XIcon } from "lucide-react";
import type { JSX, RefObject } from "react";
import { useEffect, useState } from "react";
import ModalImage from "@/components/modal-image";
import { Button } from "@/components/ui/button";
import type { CarouselApi } from "@/components/ui/carousel";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import type { ImageType } from "@/lib/types";

type ImageGalleryProps = {
	open: boolean;
	images: ImageType[];
	initialIndex: number;
	onClose: () => void;
	returnFocusRef: RefObject<HTMLButtonElement | null>;
};

const OpenImageGallery = ({
	images,
	initialIndex,
	onClose,
	returnFocusRef,
}: Omit<ImageGalleryProps, "open">): JSX.Element => {
	const [api, setApi] = useState<CarouselApi>();
	const [currentIndex, setCurrentIndex] = useState(initialIndex);

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

	useEffect(() => {
		if (api) {
			api.scrollTo(initialIndex, true);
		}
	}, [initialIndex, api]);

	return (
		<Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent
				showCloseButton={false}
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					returnFocusRef.current?.focus();
				}}
				className="inset-0 translate-x-0 translate-y-0 max-w-none sm:max-w-none w-full h-full rounded-none border-none bg-black/95 p-0 shadow-none gap-0 flex flex-col data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100"
			>
				<DialogTitle className="sr-only">Image Gallery</DialogTitle>
				<DialogDescription className="sr-only">
					Viewing image {currentIndex + 1} of {images.length}
				</DialogDescription>

				<Carousel
					className="flex-1 min-h-0 flex flex-col"
					opts={{ startIndex: initialIndex, watchDrag: true }}
					setApi={setApi}
				>
					<DialogClose asChild>
						<Button
							variant="ghost"
							size="icon"
							aria-label="Close image modal"
							className="absolute top-3 right-3 z-10 size-10 max-md:size-8 text-light/70 hover:text-light hover:bg-white/10"
						>
							<XIcon className="size-6 max-md:size-5" />
						</Button>
					</DialogClose>

					<CarouselContent className="h-full ml-0">
						{images.map((image, index) => (
							<CarouselItem
								key={`gallery-slide-${image.id}`}
								aria-label={`${index + 1} of ${images.length}`}
								aria-hidden={index !== currentIndex}
								className="h-full pl-0 flex justify-center"
							>
								<ModalImage
									image={image}
									priority={Math.abs(index - currentIndex) <= 1}
								/>
							</CarouselItem>
						))}
					</CarouselContent>

					<CarouselPrevious
						variant="ghost"
						className="left-2 top-1/2 -translate-y-1/2 size-10 max-md:size-8 border-none text-light/70 hover:text-light hover:bg-white/10 disabled:opacity-0"
					/>
					<CarouselNext
						variant="ghost"
						className="right-2 top-1/2 -translate-y-1/2 size-10 max-md:size-8 border-none text-light/70 hover:text-light hover:bg-white/10 disabled:opacity-0"
					/>
				</Carousel>

				<div
					aria-live="polite"
					className="pb-3 text-center text-light/70 text-sm"
				>
					{currentIndex + 1} / {images.length}
				</div>
			</DialogContent>
		</Dialog>
	);
};

const ImageGallery = (props: ImageGalleryProps): JSX.Element | null => {
	if (!props.open) {
		return null;
	}
	return (
		<OpenImageGallery
			images={props.images}
			initialIndex={props.initialIndex}
			onClose={props.onClose}
			returnFocusRef={props.returnFocusRef}
		/>
	);
};

export default ImageGallery;

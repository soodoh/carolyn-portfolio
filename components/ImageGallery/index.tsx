"use client";

import ModalImage from "@/components/ModalImage";
import { Button } from "@/components/ui/button";
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
import { XIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";
import type { ImageType } from "@/lib/types";

const ImageGallery = ({
  open,
  images,
  initialIndex,
  onClose,
}: {
  open: boolean;
  images: ImageType[];
  initialIndex: number;
  onClose: () => void;
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Scroll to initial index when the carousel API is ready or initialIndex changes
  const handleApi = useCallback(
    (carouselApi: CarouselApi) => {
      setApi(carouselApi);
      if (carouselApi) {
        carouselApi.scrollTo(initialIndex, true);
        setCurrentIndex(initialIndex);
      }
    },
    [initialIndex],
  );

  // Track current slide index
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // When dialog opens, scroll to the requested initial index
  useEffect(() => {
    if (open && api) {
      api.scrollTo(initialIndex, true);
    }
  }, [open, initialIndex, api]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="inset-0 translate-x-0 translate-y-0 max-w-none sm:max-w-none w-full h-full rounded-none border-none bg-black/95 p-0 shadow-none gap-0 flex flex-col data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100"
      >
        <DialogTitle className="sr-only">Image Gallery</DialogTitle>
        <DialogDescription className="sr-only">
          Viewing image {currentIndex + 1} of {images.length}
        </DialogDescription>

        {/* Carousel — close button is inside so Dialog's auto-focus
             lands within the carousel subtree, enabling its onKeyDownCapture */}
        <Carousel
          className="flex-1 min-h-0 flex flex-col"
          opts={{ startIndex: initialIndex, watchDrag: true }}
          setApi={handleApi}
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

          <CarouselContent className="h-full">
            {images.map((image) => (
              <CarouselItem
                key={`gallery-slide-${image.id}`}
                className="h-full p-4 max-md:p-2"
              >
                <ModalImage image={image} />
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

        {/* Counter — below image */}
        <div className="pb-3 text-center text-light/70 text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageGallery;

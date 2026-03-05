"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { JSX, KeyboardEvent } from "react";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = createContext<CarouselContextProps | undefined>(
  undefined,
);

function useCarousel(): CarouselContextProps {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps): JSX.Element {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) {
      return;
    }
    setCanScrollPrev(carouselApi.canScrollPrev());
    setCanScrollNext(carouselApi.canScrollNext());
  }, []);

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  useEffect(() => {
    if (!api || !setApi) {
      return;
    }
    setApi(api);
  }, [api, setApi]);

  useEffect(() => {
    if (!api) {
      return;
    }
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  const contextValue = useMemo(
    () => ({
      carouselRef,
      api,
      opts,
      orientation:
        orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
      scrollPrev,
      scrollNext,
      canScrollPrev,
      canScrollNext,
    }),
    [
      api,
      canScrollNext,
      canScrollPrev,
      carouselRef,
      opts,
      orientation,
      scrollNext,
      scrollPrev,
    ],
  );

  const classes: string = cn("relative", className);

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        onKeyDownCapture={handleKeyDown}
        className={classes}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({
  className,
  ...props
}: React.ComponentProps<"div">): JSX.Element {
  const { carouselRef, orientation } = useCarousel();
  const classes: string = cn(
    "flex",
    orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
    className,
  );

  return (
    <div
      ref={carouselRef}
      className="h-full overflow-hidden"
      data-slot="carousel-content"
    >
      <div className={classes} {...props} />
    </div>
  );
}

function CarouselItem({
  className,
  ...props
}: React.ComponentProps<"div">): JSX.Element {
  const { orientation } = useCarousel();
  const classes: string = cn(
    "min-w-0 shrink-0 grow-0 basis-full",
    orientation === "horizontal" ? "pl-4" : "pt-4",
    className,
  );

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={classes}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>): JSX.Element {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  const classes: string = cn(
    "absolute size-8",
    orientation === "horizontal"
      ? "top-1/2 -left-12 -translate-y-1/2"
      : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
    className,
  );

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={classes}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft className="size-6" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>): JSX.Element {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  const classes: string = cn(
    "absolute size-8",
    orientation === "horizontal"
      ? "top-1/2 -right-12 -translate-y-1/2"
      : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
    className,
  );

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={classes}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight className="size-6" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};

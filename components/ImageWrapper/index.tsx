import NextImage from "next/image";
import type { ImageType } from "@/lib/types";

type Props = {
  image: ImageType;
  quality?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  onLoad?: () => void;
};

const ImageWrapper = ({
  image,
  quality = 100,
  priority = false,
  className,
  onLoad,
  sizes = [
    "(max-width: 399px) 184px",
    "(max-width: 519px) 244px",
    "(max-width: 639px) 200px",
    "(max-width: 767px) 156px",
    "(max-width: 1023px) 220px",
    "(max-width: 1279px) 280px",
    "280px",
  ].join(", "),
}: Props) => {
  return (
    <NextImage
      className={className ?? "w-full h-auto object-contain"}
      priority={priority}
      width={image.width}
      height={image.height}
      alt={image.description}
      blurDataURL={image.placeholder}
      placeholder="blur"
      sizes={sizes}
      src={image.url}
      quality={quality}
      onLoad={onLoad}
    />
  );
};

export default ImageWrapper;

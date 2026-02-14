"use client";

import ImageWrapper from "@/components/ImageWrapper";
import { cn } from "@/lib/utils";
import type { ImageType } from "@/lib/types";

const Background = ({
  fixed = false,
  image,
}: {
  fixed?: boolean;
  image: ImageType;
}) => {
  return (
    <div
      className={cn("bg-dark h-screen absolute inset-0 -z-1", fixed && "fixed")}
    >
      <ImageWrapper
        className="w-full h-full object-cover"
        priority
        image={image}
        sizes="100vw"
      />
    </div>
  );
};

export default Background;

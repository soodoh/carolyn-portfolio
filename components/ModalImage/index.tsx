"use client";

import ImageWrapper from "@/components/ImageWrapper";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import { useState } from "react";
import type { ImageType } from "@/lib/types";

type Props = {
  image: ImageType;
};

// This component is a workaround for the Next.js Image component
// not behaving as expected with blur placeholders with object-fit contain
const ModalImage = ({ image }: Props) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <NextImage
          className="w-full h-full object-contain"
          priority
          width={image.width}
          height={image.height}
          alt={image.description}
          src={image.placeholder}
        />
      )}
      <ImageWrapper
        className={cn("w-full h-full object-contain", !loaded && "hidden")}
        priority
        image={image}
        onLoad={() => setLoaded(true)}
        sizes="100vw"
      />
    </>
  );
};

export default ModalImage;

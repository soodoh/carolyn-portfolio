"use client";

import ImageWrapper from "@/components/ImageWrapper";
import classNames from "classnames/bind";
import NextImage from "next/image";
import { useState } from "react";
import styles from "./modalImage.module.css";
import type { ImageType } from "@/lib/types";

const cx = classNames.bind(styles);

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
          className={styles.image}
          priority
          width={image.width}
          height={image.height}
          alt={image.description}
          src={image.placeholder}
        />
      )}
      <ImageWrapper
        className={cx({ image: true, loading: !loaded })}
        priority
        image={image}
        onLoad={() => setLoaded(true)}
        sizes="100vw"
      />
    </>
  );
};

export default ModalImage;

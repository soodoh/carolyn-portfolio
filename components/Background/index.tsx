"use client";

import { imageLoader } from "@/lib/image-loader";
import classNames from "classnames/bind";
import Image from "next/image";
import React from "react";
import styles from "./background.module.css";
import type { ImageType } from "@/lib/types";

const cx = classNames.bind(styles);

const Background = ({
  fixed = false,
  image,
}: {
  fixed?: boolean;
  image: ImageType;
}) => {
  const sizes = [
    "(max-width: 399px) 480px",
    "(max-width: 519px) 768px",
    "(max-width: 639px) 1024px",
    "(max-width: 767px) 1366px",
    "(max-width: 1023px) 1600px",
    "(max-width: 1279px) 1920px",
    "1920px",
  ].join(", ");

  return (
    <div className={cx({ container: true, fixed })}>
      <Image
        priority
        alt={image.description}
        className={styles.image}
        blurDataURL={image.placeholder}
        height={image.height}
        loader={imageLoader}
        placeholder="blur"
        sizes={sizes}
        src={image.url}
        width={image.width}
      />
    </div>
  );
};

export default Background;

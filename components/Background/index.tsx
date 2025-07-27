"use client";

import ImageWrapper from "@/components/ImageWrapper";
import classNames from "classnames/bind";
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
  return (
    <div className={cx({ container: true, fixed })}>
      <ImageWrapper
        className={styles.image}
        priority
        image={image}
        sizes="100vw"
      />
    </div>
  );
};

export default Background;

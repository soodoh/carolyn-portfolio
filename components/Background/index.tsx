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
  // const sizes = [
  //   "(max-width: 399px) 480px",
  //   "(max-width: 519px) 768px",
  //   "(max-width: 639px) 1024px",
  //   "(max-width: 767px) 1366px",
  //   "(max-width: 1023px) 1600px",
  //   "(max-width: 1279px) 1920px",
  //   "1920px",
  // ].join(", ");

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

import type { ImageLoaderProps } from "next/image";

export default function contentfulImageLoader({
  src,
  width,
  quality = 100,
}: ImageLoaderProps) {
  const searchParams = new URLSearchParams({
    w: `${width}`,
    q: `${quality}`,
    fm: "webp",
  });
  return `${src}?${searchParams.toString()}`;
}

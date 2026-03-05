"use client";

import Filter from "@/components/filter";
import ImageGallery from "@/components/image-gallery";
import ImageWrapper from "@/components/image-wrapper";
import Masonry from "@/components/masonry";
import { Button } from "@/components/ui/button";
import type { Album, ImageType } from "@/lib/types";
import type { JSX } from "react";
import { useMemo, useState } from "react";

const PhotographyContent = ({ albums }: { albums: Album[] }): JSX.Element => {
  const albumNames: string[] = useMemo(() => {
    return albums.map((album) => album.name);
  }, [albums]);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [albumName, setAlbumName] = useState(albumNames[0]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const galleryImages = useMemo(
    () => albums.find((album) => album.name === albumName)?.photos ?? [],
    [albums, albumName],
  );

  function handleAlbumChange(newAlbum: string) {
    setAlbumName(newAlbum);
  }

  const handleThumbnailClick = (image: ImageType) => {
    setCurrentPhotoIndex(galleryImages.indexOf(image));
    setGalleryOpen(true);
  };

  return (
    <>
      <Filter
        options={albumNames}
        current={albumName}
        onChange={handleAlbumChange}
      />

      <ImageGallery
        open={galleryOpen}
        initialIndex={currentPhotoIndex}
        images={galleryImages}
        onClose={() => setGalleryOpen(false)}
      />

      <div role="tabpanel">
        <Masonry>
          {galleryImages.map((image) => (
            <Button
              key={`image-${image.id}`}
              variant="ghost"
              aria-label={`View fullscreen photo (${image.title})`}
              onClick={() => handleThumbnailClick(image)}
              className="h-auto w-full p-0 rounded-none hover:bg-transparent"
            >
              <ImageWrapper quality={50} image={image} />
            </Button>
          ))}
        </Masonry>
      </div>
    </>
  );
};

export default PhotographyContent;

"use client";

import Filter from "@/components/Filter";
import ImageGallery from "@/components/ImageGallery";
import ImageWrapper from "@/components/ImageWrapper";
import Masonry from "@/components/Masonry";
import { Button } from "@/components/ui/button";
import { Album, ImageType } from "@/lib/types";
import { useMemo, useState } from "react";

const PhotographyContent = ({ albums }: { albums: Album[] }) => {
  const albumNames: string[] = useMemo(() => {
    return albums.map((album) => album.name);
  }, [albums]);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [albumName, setAlbumName] = useState(albumNames[0]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const galleryImages = useMemo(
    () => albums.find((album) => album.name === albumName)?.photos || [],
    [albums, albumName],
  );

  function handleAlbumChange(newAlbum: string) {
    setAlbumName(newAlbum);
  }

  const handleThumbnailClick = (image: ImageType) => {
    setCurrentPhotoIndex(galleryImages.findIndex((cur) => cur === image));
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

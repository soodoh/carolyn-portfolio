"use client";

import Filter from "@/components/Filter";
import ImageGallery from "@/components/ImageGallery";
import ImageWrapper from "@/components/ImageWrapper";
import Masonry from "@/components/Masonry";
import { Album, ImageType } from "@/lib/types";
import { useMemo, useState } from "react";
import styles from "./photographyContent.module.css";

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
        index={currentPhotoIndex}
        setIndex={setCurrentPhotoIndex}
        images={galleryImages}
        onClose={() => setGalleryOpen(false)}
      />

      <div role="tabpanel">
        <Masonry>
          {galleryImages.map((image) => (
            <button
              key={`image-${image.id}`}
              aria-label={`View fullscreen photo (${image.title})`}
              onClick={() => handleThumbnailClick(image)}
              className={styles.button}
            >
              <ImageWrapper image={image} />
            </button>
          ))}
        </Masonry>
      </div>
    </>
  );
};

export default PhotographyContent;

import LeftChevron from "@/components/icons/LeftChevron";
import RightChevron from "@/components/icons/RightChevron";
import ModalImage from "@/components/ModalImage";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useEffect } from "react";
import styles from "./imageGallery.module.css";
import type { ImageType } from "@/lib/types";

const ImageGallery = ({
  open,
  images,
  index,
  setIndex,
  onClose,
}: {
  open: boolean;
  images: ImageType[];
  index: number;
  setIndex: (index: number) => void;
  onClose: () => void;
}) => {
  useEffect(() => {
    const handleKeypress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && index > 0) {
        setIndex(index - 1);
      } else if (event.key === "ArrowRight" && index <= images.length - 2) {
        setIndex(index + 1);
      }
    };
    window.addEventListener("keydown", handleKeypress);
    return () => {
      window.removeEventListener("keydown", handleKeypress);
    };
  }, [images.length, index, setIndex]);

  return (
    <Dialog open={open} onClose={onClose} className={styles.dialog}>
      <DialogBackdrop className={styles.backdrop} />

      <DialogPanel className={styles.dialogContent}>
        <div className={styles.close}>
          <button aria-label="Close image modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.prev}>
          {index > 0 && (
            <button
              aria-label="Previous photo"
              onClick={() => {
                setIndex(index - 1);
              }}
            >
              <LeftChevron />
            </button>
          )}
        </div>

        <div className={styles.imageContainer}>
          <ModalImage key={`image-modal-${index}`} image={images[index]} />
        </div>

        <div className={styles.next}>
          {index <= images.length - 2 && (
            <button
              aria-label="Next photo"
              onClick={() => {
                setIndex(index + 1);
              }}
            >
              <RightChevron />
            </button>
          )}
        </div>

        <div className={styles.info}>
          {index + 1} / {images.length}
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default ImageGallery;

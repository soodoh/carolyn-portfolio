import React, { ReactElement, useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import Backdrop from '@material-ui/core/Backdrop';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { ChevronLeft, ChevronRight, Close } from '@material-ui/icons';
import Img from 'gatsby-image';
import { Photo } from '../../types';

const useStyles = makeStyles(theme => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
  container: {
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    gridTemplateColumns: 'auto 1fr auto',
  },
  prevButton: {
    gridRow: '2/3',
    gridColumn: '1/2',
    display: 'flex',
    alignItems: 'center',
  },
  nextButton: {
    gridRow: '2/3',
    gridColumn: '3/4',
    display: 'flex',
    alignItems: 'center',
  },
  closeButton: {
    gridRow: '1/2',
    gridColumn: '3/4',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  imageContainer: {
    gridRow: '2/3',
    gridColumn: '2/3',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Not needed if we calculate dimensions right.
  },
  imageText: {
    gridRow: '3/4',
    gridColumn: '2/3',
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

interface ModalProps {
  onChange: (index: number) => void;
  onClose: () => void;
  images: Photo[];
  photoIndex: number;
}

const ImageModal = (props: ModalProps): ReactElement => {
  if (typeof window === 'undefined') return null;
  const { onChange, onClose, images, photoIndex } = props;
  const classes = useStyles();
  const currentPhoto = images[photoIndex];
  const imageContainerRef = useRef<HTMLDivElement>();

  const handleKeys = (event: KeyboardEvent) => {
    if (event.keyCode === 27) {
      // Escape
      onClose();
    } else if (event.keyCode === 37 && photoIndex > 0) {
      // Left Arrow
      onChange(photoIndex - 1);
    } else if (event.keyCode === 39 && photoIndex <= images.length - 2) {
      // Right Arrow
      onChange(photoIndex + 1);
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleKeys);
    return () => {
      window.removeEventListener('keydown', handleKeys);
    };
  }, [photoIndex]);

  // Below is some annoying math to set the exact image dimensions to fill the screen.
  // Depending on aspect ratio, we know the image is either limited by X or Y (width or height)
  const imageAspectRatio = currentPhoto?.fullSize?.aspectRatio;
  const maxWidth = imageContainerRef.current?.offsetWidth;
  const maxHeight = imageContainerRef.current?.offsetHeight;
  const calculatedWidth = maxHeight * imageAspectRatio;
  const calculatedHeight = maxWidth / imageAspectRatio;
  const maximizeWidth = { width: maxWidth, height: calculatedHeight };
  const maximizeHeight = { width: calculatedWidth, height: maxHeight };
  // None of this works until we know the aspect ratio
  let imageStyles = {};
  if (imageAspectRatio) {
    imageStyles = calculatedWidth > maxWidth ? maximizeWidth : maximizeHeight;
  }

  return (
    <Backdrop className={classes.backdrop} open={!!currentPhoto} onClick={onClose}>
      <div className={classes.container}>
        <div className={classes.prevButton}>
          <IconButton
            color="secondary"
            disabled={photoIndex < 1}
            onClick={event => {
              event.stopPropagation();
              onChange(photoIndex - 1);
            }}
          >
            <ChevronLeft />
          </IconButton>
        </div>

        <div className={classes.closeButton}>
          <IconButton color="secondary" onClick={onClose}>
            <Close />
          </IconButton>
        </div>

        <div className={classes.imageContainer} ref={imageContainerRef}>
          <div style={imageStyles} onClick={event => event.stopPropagation()}>
            {currentPhoto && <Img fluid={currentPhoto?.fullSize} />}
          </div>
        </div>

        <div className={classes.imageText}>
          <Typography variant="subtitle1" color="secondary">
            {currentPhoto?.description || ''}
          </Typography>
          <Typography variant="subtitle1" color="secondary">{`${photoIndex + 1} / ${images.length}`}</Typography>
        </div>

        <div className={classes.nextButton}>
          <IconButton
            color="secondary"
            disabled={photoIndex >= images.length - 1}
            onClick={event => {
              event.stopPropagation();
              onChange(photoIndex + 1);
            }}
          >
            <ChevronRight />
          </IconButton>
        </div>
      </div>
    </Backdrop>
  );
};

export default ImageModal;

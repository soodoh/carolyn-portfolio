import React, { ReactElement, useState, useEffect } from 'react';
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
    display: 'flex',
    alignItems: 'center',
  },
  topRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bottomRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageContainer: {
    flex: 1,
    margin: '1rem 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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

  const [windowAspectRatio, setWindowRatio] = useState(window.innerWidth / window.innerHeight);
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
  const handleResize = () => {
    setWindowRatio(window.innerWidth / window.innerHeight);
  };
  useEffect(() => {
    window.addEventListener('keydown', handleKeys);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeys);
      window.removeEventListener('resize', handleResize);
    };
  }, [photoIndex]);

  const imageAspectRatio = currentPhoto?.fullSize?.aspectRatio;

  // Both viewport and image are landscape OR image is portrait and wider than viewport
  const useFullWidth = windowAspectRatio < imageAspectRatio && ((windowAspectRatio > 1 && imageAspectRatio > 1) || imageAspectRatio < 1);
  const width = useFullWidth ? '100%' : `calc(90vh * ${imageAspectRatio})`;

  return (
    <Backdrop className={classes.backdrop} open={!!currentPhoto} onClick={onClose}>
      <div className={classes.container}>
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
        <div className={classes.imageContainer}>
          <div className={classes.topRow} style={{ width }}>
            <IconButton color="secondary" onClick={onClose}>
              <Close />
            </IconButton>
          </div>
          <div style={{ width }} onClick={event => event.stopPropagation()}>
            {currentPhoto && <Img fluid={currentPhoto?.fullSize} />}
          </div>
          <div className={classes.bottomRow} style={{ width }}>
            <Typography variant="subtitle1" color="secondary">
              {currentPhoto?.description}
            </Typography>
            <Typography variant="subtitle1" color="secondary">{`${photoIndex + 1} / ${images.length}`}</Typography>
          </div>
        </div>
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
    </Backdrop>
  );
};

export default ImageModal;

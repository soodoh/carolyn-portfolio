import React, { ReactElement, useState } from 'react';
import Img from 'gatsby-image';
import { makeStyles } from '@material-ui/styles';
import Lightbox from 'react-images';
import Masonry from '../common/Masonry';
import { Photo } from '../../types';

const useStyles = makeStyles(() => ({
  photo: {
    cursor: 'pointer',
    width: '100%',
  },
}));

interface GalleryProps {
  photos: Photo[];
}

const Gallery = (props: GalleryProps): ReactElement => {
  const classes = useStyles();
  const { photos } = props;
  const [photoActive, setActive] = useState(false);
  const [currentPhoto, setPhoto] = useState(0);

  return (
    <>
      <Lightbox
        images={photos.map(photo => ({
          src: photo.fullSize.src,
          srcSet: photo.fullSize.srcSet,
          alt: photo.title,
        }))}
        isOpen={photoActive}
        backdropClosesModal
        currentImage={currentPhoto}
        onClickPrev={() => setPhoto(currentPhoto - 1)}
        onClickNext={() => setPhoto(currentPhoto + 1)}
        onClose={() => setActive(false)}
      />

      <Masonry>
        {photos.map((photo, index) => ({
          id: photo.id,
          element: (
            <div
              key={photo.id}
              role="button"
              aria-label={`Open Photo "${photo.title}"`}
              tabIndex={0}
              onClick={() => {
                setPhoto(index);
                setActive(true);
              }}
              onKeyPress={event => {
                if (event.charCode === 13) {
                  setPhoto(index);
                  setActive(true);
                }
              }}
            >
              <Img fluid={photo.thumbnail} alt={photo.title} className={classes.photo} />
            </div>
          ),
        }))}
      </Masonry>
    </>
  );
};

export default Gallery;

import React, { ReactElement, useState } from 'react';
import Img from 'gatsby-image';
import { makeStyles } from '@material-ui/styles';
import Masonry from '../common/Masonry';
import Lightbox from './Lightbox';
import { Photo } from '../../types';

const useStyles = makeStyles(() => ({
  photoContainer: {
    width: '100%',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  },
}));

interface GalleryProps {
  photos: Photo[];
}

const Gallery = (props: GalleryProps): ReactElement => {
  const classes = useStyles();
  const { photos } = props;
  const [currentPhoto, setPhoto] = useState(null);

  return (
    <>
      <Lightbox images={photos} onChange={setPhoto} onClose={() => setPhoto(null)} photoIndex={currentPhoto} />

      <Masonry>
        {photos.map((photo, index) => ({
          id: photo.id,
          element: (
            <button
              key={photo.id}
              className={classes.photoContainer}
              onClick={() => {
                setPhoto(index);
              }}
            >
              <Img fluid={photo.thumbnail} alt={photo.title} />
            </button>
          ),
        }))}
      </Masonry>
    </>
  );
};

export default Gallery;

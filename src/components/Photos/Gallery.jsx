import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import { makeStyles } from '@material-ui/styles';
import { uid } from 'react-uid';
import Lightbox from 'react-images';
import Masonry from '../common/Masonry';

const useStyles = makeStyles(() => ({
  photo: {
    cursor: 'pointer',
    width: '100%',
  },
}));

const Gallery = props => {
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
        {photos.map((photo, index) => (
          <div
            key={uid(photo, index)}
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
        ))}
      </Masonry>
    </>
  );
};

Gallery.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.shape({
      thumbnail: PropTypes.shape({}),
      title: PropTypes.string,
    }),
  ).isRequired,
};

export default Gallery;

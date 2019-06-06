import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import { makeStyles } from '@material-ui/styles';
import { uid } from 'react-uid';
import Masonry from 'react-masonry-component';
import Lightbox from 'react-images';

const useStyles = makeStyles(theme => ({
  photoContainer: {
    position: 'relative',
    margin: theme.spacing(4),
    cursor: 'pointer',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 'auto',
    verticalAlign: 'top', // Removes bottom gutter for Masonry
  },
  // Breakpoints
  [theme.breakpoints.down('lg')]: {
    projectContainer: {
      width: '25%',
    },
  },
  [theme.breakpoints.down('md')]: {
    projectContainer: {
      width: '33.33%',
    },
  },
  [theme.breakpoints.down('sm')]: {
    projectContainer: {
      width: '50%',
    },
  },
  [theme.breakpoints.down('xs')]: {
    projectContainer: {
      width: '100%',
    },
  },
}));

const Gallery = (props) => {
  const classes = useStyles();
  const { photos, ...other } = props;
  const [photoActive, setActive] = useState(false);
  const [currentPhoto, setPhoto] = useState(0);

  return (
    <Masonry {...other}>
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
      {photos.map((photo, index) => (
        <div
          key={uid(photo, index)}
          className={classes.projectContainer}
        >
          <div
            className={classes.photoContainer}
            role="button"
            aria-label={`Open Photo "${photo.title}"`}
            tabIndex={0}
            onClick={() => {
              setPhoto(index);
              setActive(true);
            }}
            onKeyPress={(event) => {
              if (event.charCode === 13) {
                setPhoto(index);
                setActive(true);
              }
            }}
          >
            <Img
              fluid={photo.thumbnail}
              alt={photo.title}
              className={classes.photo}
            />
          </div>
        </div>
      ))}
    </Masonry>
  );
};

Gallery.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.object,
  ).isRequired,
};

export default Gallery;

import React from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import { withStyles } from '@material-ui/core/styles';
import { uid } from 'react-uid';
import Masonry from 'react-masonry-component';
import Lightbox from 'react-images';

class Gallery extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      photoActive: false,
      currentPhoto: 0,
    };
  }

  render() {
    const { classes, photos, ...other } = this.props;
    const { photoActive, currentPhoto } = this.state;

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
          onClickPrev={() => this.setState({ currentPhoto: currentPhoto - 1 })}
          onClickNext={() => this.setState({ currentPhoto: currentPhoto + 1 })}
          onClose={() => this.setState({ photoActive: false })}
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
              onClick={() => this.setState({ photoActive: true, currentPhoto: index })}
              onKeyPress={(event) => {
                if (event.charCode === 13) {
                  this.setState({ photoActive: true, currentPhoto: index });
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
  }
}

Gallery.propTypes = {
  classes: PropTypes.shape({
    photoContainer: PropTypes.string,
    photo: PropTypes.string,
  }).isRequired,
  photos: PropTypes.arrayOf(
    PropTypes.object,
  ).isRequired,
};

const styles = theme => ({
  photoContainer: {
    position: 'relative',
    margin: theme.spacing.unit * 4,
    cursor: 'pointer',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 'auto',
    verticalAlign: 'top', // Removes bottom gutter for Masonry
  },
  // Breakpoints
  [`@media (min-width: ${theme.breakpoints.values.xs}px)`]: {
    projectContainer: {
      width: '100%',
    },
  },
  [`@media (min-width: ${theme.breakpoints.values.sm}px)`]: {
    projectContainer: {
      width: '50%',
    },
  },
  [`@media (min-width: ${theme.breakpoints.values.md}px)`]: {
    projectContainer: {
      width: '33.33%',
    },
  },
  [`@media (min-width: ${theme.breakpoints.values.xl}px)`]: {
    projectContainer: {
      width: '25%',
    },
  },
});

export default withStyles(styles)(Gallery);

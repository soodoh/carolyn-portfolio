import React from 'react';
import PropTypes from 'prop-types';
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
          images={photos.map(photo => ({ src: photo.url }))}
          isOpen={photoActive}
          backdropClosesModal
          currentImage={currentPhoto}
          onClickPrev={() => this.setState({ currentPhoto: currentPhoto - 1 })}
          onClickNext={() => this.setState({ currentPhoto: currentPhoto + 1 })}
          onClose={() => this.setState({ photoActive: false })}
        />
        {Array.isArray(photos) && photos.map((photo, index) => (
          <div
            key={uid(photo)}
            className={classes.projectContainer}
          >
            <div className={classes.photoContainer}>
              <img
                src={`${photo.url}?w=400`}
                alt={photo.title}
                role="presentation"
                className={classes.photo}
                onClick={() => this.setState({ photoActive: true, currentPhoto: index })}
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

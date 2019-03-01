import React from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import { navigate } from 'gatsby';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import { withStyles } from '@material-ui/core/styles';
import Zoom from '@material-ui/core/Zoom';
import detectIt from 'detect-it';
import slugify from 'slugify';

class ProjectThumbnail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      labelActive: detectIt.deviceType === 'touchOnly' || false,
    };
    this.toggleLabel = this.toggleLabel.bind(this);
  }

  toggleLabel() {
    const { labelActive } = this.state;
    this.setState({ labelActive: !labelActive });
  }

  render() {
    const { classes, data } = this.props;
    const { labelActive } = this.state;
    const slug = slugify(data.title, {
      replacement: '-',
      remove: /[^\w\s]/g,
      lower: true,
    });

    return (
      <div className={classes.projectContainer}>
        <div
          className={classes.photoContainer}
          role="presentation"
          onClick={() => navigate(`projects/${slug}`)}
          onMouseEnter={() => this.setState({ labelActive: true })}
          onMouseLeave={() => this.setState({ labelActive: false })}
        >
          <Img
            fluid={data.coverImage.fluid}
            alt={data.coverImage.title}
            className={classes.photo}
          />
          <Zoom in={detectIt.deviceType === 'touchOnly' || labelActive}>
            <GridListTileBar
              title={data.title}
              subtitle={data.summary && data.summary.summary}
              className={classes.label}
            />
          </Zoom>
        </div>
      </div>
    );
  }
}

ProjectThumbnail.propTypes = {
  classes: PropTypes.shape({
    photoContainer: PropTypes.string,
    photo: PropTypes.string,
  }).isRequired,
  data: PropTypes.shape({}).isRequired,
};

const styles = theme => ({
  photoContainer: {
    position: 'relative',
    margin: theme.spacing.unit * 5,
    cursor: 'pointer',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 'auto',
    verticalAlign: 'top', // Removes bottom gutter for Masonry
  },
  link: {
    width: '100%',
    height: 'auto',
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

export default withStyles(styles)(ProjectThumbnail);

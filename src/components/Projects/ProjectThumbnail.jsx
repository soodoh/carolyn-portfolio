import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import { navigate } from 'gatsby';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import { makeStyles } from '@material-ui/styles';
import Zoom from '@material-ui/core/Zoom';
import detectIt from 'detect-it';
import slugify from 'slugify';

const useStyles = makeStyles(theme => ({
  photoContainer: {
    position: 'relative',
    margin: theme.spacing(5),
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
  [theme.breakpoints.down('xl')]: {
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

const ProjectThumbnail = (props) => {
  const classes = useStyles();
  const { data } = props;
  const slug = slugify(data.title, {
    replacement: '-',
    remove: /[^\w\s]/g,
    lower: true,
  });
  const [labelActive, setLabel] = useState(detectIt.deviceType === 'touchOnly');

  return (
    <div className={classes.projectContainer}>
      <div
        className={classes.photoContainer}
        role="presentation"
        onClick={() => navigate(`projects/${slug}`)}
        onMouseEnter={() => setLabel(true)}
        onMouseLeave={() => setLabel(false)}
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
};

ProjectThumbnail.propTypes = {
  data: PropTypes.shape({}).isRequired,
};

export default ProjectThumbnail;

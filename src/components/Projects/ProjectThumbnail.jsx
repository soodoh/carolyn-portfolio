import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import { navigate } from 'gatsby';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import { makeStyles } from '@material-ui/styles';
import Zoom from '@material-ui/core/Zoom';
import detectIt from 'detect-it';
import slugify from 'slugify';

const useStyles = makeStyles({
  photoContainer: {
    position: 'relative',
  },
  photo: {
    cursor: 'pointer',
  },
});

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
  );
};

ProjectThumbnail.propTypes = {
  data: PropTypes.shape({
    coverImage: PropTypes.shape({
      fluid: PropTypes.shape({}),
      title: PropTypes.string,
    }).isRequired,
    title: PropTypes.string.isRequired,
    summary: PropTypes.shape({
      summary: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default ProjectThumbnail;

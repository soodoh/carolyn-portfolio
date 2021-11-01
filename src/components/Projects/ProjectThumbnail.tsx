import React, { ReactElement } from 'react';
import Img from 'gatsby-image';
import { Link } from 'gatsby';
import { makeStyles } from '@material-ui/styles';
import slugify from 'slugify';
import { Project } from '../../types';

const useStyles = makeStyles(theme => ({
  photoContainer: {
    position: 'relative',
  },
  photo: {
    cursor: 'pointer',
  },
  labelContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    opacity: 0,
    transition: 'opacity 300ms ease-in-out',
    '&:hover': {
      transition: 'opacity 300ms ease-in-out',
      opacity: 1,
    },

    // So that text and background have different opacities
    // Don't want to use rgba() so that we can programmatically get the color from theme
    '&::before': {
      content: '""',
      backgroundColor: theme.palette.background.default,
      opacity: 0.9,
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 2,
    },
    '& h3,h4': {
      margin: 0,
      zIndex: 3,
      color: theme.palette.primary.main,
    },
    '& h3': {
      fontSize: '1.5em',
      lineHeight: '1em',
      marginBottom: '0.3em',
    },
    '& h4': {
      fontSize: '1em',
      fontWeight: 'bolder',
    },
  },
}));

interface ThumbnailProps {
  data: Project;
}

const ProjectThumbnail = (props: ThumbnailProps): ReactElement => {
  const classes = useStyles();
  const { data } = props;
  const slug = slugify(data.title, {
    replacement: '-',
    remove: /[^\w\s]/g,
    lower: true,
  });

  return (
    <div className={classes.photoContainer}>
      <div className={classes.labelContainer}>
        <h3>{data.title}</h3>

        <h4>{data.summary.summary}</h4>
      </div>
      <Link to={`/projects/${slug}`}>
        <Img fluid={data.coverImage.fluid} alt={data.coverImage.title} className={classes.photo} />
      </Link>
    </div>
  );
};

export default ProjectThumbnail;

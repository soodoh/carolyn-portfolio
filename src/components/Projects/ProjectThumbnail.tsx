import React, { ReactElement, useState } from 'react';
import Img from 'gatsby-image';
import { Link } from 'gatsby';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import { makeStyles } from '@material-ui/styles';
import Zoom from '@material-ui/core/Zoom';
import detectIt from 'detect-it';
import slugify from 'slugify';
import { Project } from '../../types';

const useStyles = makeStyles({
  photoContainer: {
    position: 'relative',
  },
  photo: {
    cursor: 'pointer',
  },
});

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
  const [labelActive, setLabel] = useState(detectIt.deviceType === 'touchOnly');

  return (
    <div className={classes.photoContainer} onMouseEnter={() => setLabel(true)} onMouseLeave={() => setLabel(false)}>
      <Link to={`/projects/${slug}`}>
        <Img fluid={data.coverImage.fluid} alt={data.coverImage.title} className={classes.photo} />
        <Zoom in={detectIt.deviceType === 'touchOnly' || labelActive}>
          <GridListTileBar title={data.title} subtitle={data.summary && data.summary.summary} className={classes.label} />
        </Zoom>
      </Link>
    </div>
  );
};

export default ProjectThumbnail;

import React, { ReactElement } from 'react';
import Player from 'react-player';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import ProjectDescription from './ProjectDescription';
import { Project } from '../../types';

const useStyles = makeStyles({
  title: {
    marginBottom: '2rem',
  },
  role: {
    fontWeight: 'bold',
  },
  videoContainer: {
    position: 'relative',
    paddingTop: '56.25%', // Player ratio: 100 / (1280 / 720)
    marginBottom: '4rem',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  pageContent: {},
});

interface VideoProjectProps {
  data: Project;
}

const VideoProject = (props: VideoProjectProps): ReactElement => {
  const classes = useStyles();
  const { data } = props;

  return (
    <div>
      <div className={classes.title}>
        <Typography variant="h2" align="center">
          {data.title}
        </Typography>
        <Typography variant="h6" className={classes.role} align="center" gutterBottom>
          {data.role}
        </Typography>
      </div>

      <div className={classes.pageContent}>
        <div className={classes.videoContainer}>
          <Player url={data.link} className={classes.video} controls width="100%" height="100%" />
        </div>

        <ProjectDescription markdown={data.description.childMarkdownRemark.html} />
      </div>
    </div>
  );
};

export default VideoProject;

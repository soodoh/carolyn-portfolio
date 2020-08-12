import React from 'react';
import PropTypes from 'prop-types';
import Player from 'react-player';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import ProjectDescription from './ProjectDescription';

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
  role: {
    fontWeight: 'bold',
  },
  videoContainer: {
    position: 'relative',
    paddingTop: '56.25%', // Player ratio: 100 / (1280 / 720)
    marginBottom: theme.spacing(5),
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  pageContent: {
    [theme.breakpoints.up('sm')]: {
      margin: '0 10vw',
    },
  },
}));

const VideoProject = (props) => {
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
          <Player
            url={data.link}
            className={classes.video}
            controls
            width="100%"
            height="100%"
          />
        </div>

        <ProjectDescription markdown={data.description.childMarkdownRemark.html} />
      </div>
    </div>
  );
};

VideoProject.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string,
    role: PropTypes.string,
    link: PropTypes.string,
    description: PropTypes.shape({
      childMarkdownRemark: PropTypes.shape({
        html: PropTypes.string,
      }),
    }),
    coverImage: PropTypes.shape({}),
  }).isRequired,
};

export default VideoProject;

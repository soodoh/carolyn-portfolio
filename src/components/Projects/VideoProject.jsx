import React from 'react';
import PropTypes from 'prop-types';
import Player from 'react-player';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: '0',
    [theme.breakpoints.up('xs')]: {
      padding: '0 10vw',
    },
  },
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
  projectContent: {
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.primary.main,
    '& img': {
      width: '100%',
    },
    marginBottom: theme.spacing(6),
  },
}));
const VideoProject = (props) => {
  const classes = useStyles();
  const { data } = props;

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Typography variant="h2" align="center">
          {data.title}
        </Typography>
        <Typography variant="subtitle1" className={classes.role} align="center" gutterBottom>
          {data.role}
        </Typography>
      </div>

      <div className={classes.videoContainer}>
        <Player
          url={data.link}
          className={classes.video}
          controls
          width="100%"
          height="100%"
        />
      </div>

      <div
        className={classes.projectContent}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: data.description.childMarkdownRemark.html }}
      />
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

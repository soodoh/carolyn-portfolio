import React from 'react';
import PropTypes from 'prop-types';
import Player from 'react-player';
import { Link } from 'gatsby';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const VideoProject = (props) => {
  const { classes, data } = props;

  return (
    <Grid container>
      <Grid item xs={12} className={classes.title}>
        <Typography variant="h4" align="center" gutterBottom>
          {data.title}
        </Typography>
        <Typography variant="h6" align="center" gutterBottom>
          {data.role}
        </Typography>
      </Grid>

      <Grid item xs={12} className={classes.videoContainer}>
        <div className={classes.videoWrapper}>
          <Player
            url={data.link}
            className={classes.video}
            controls
            width="100%"
            height="100%"
          />
        </div>
      </Grid>

      <Grid
        item
        xs={12}
        className={classes.projectContent}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: data.description.childMarkdownRemark.html }}
      />

      <Grid item xs={12} className={classes.buttonGroup}>
        <Button
          component={Link}
          to="projects"
          variant="contained"
          color="secondary"
        >
          View More Work
        </Button>
      </Grid>
    </Grid>
  );
};

VideoProject.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  data: PropTypes.shape({
    title: PropTypes.string,
    role: PropTypes.string,
    link: PropTypes.string,
    description: PropTypes.object,
    coverImage: PropTypes.object,
  }).isRequired,
};

const styles = theme => ({
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  videoContainer: {
    marginBottom: theme.spacing.unit * 4,
  },
  videoWrapper: {
    position: 'relative',
    paddingTop: '56.25%', // Player ratio: 100 / (1280 / 720)
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
    marginBottom: theme.spacing.unit * 6,
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
  },
});

export default withStyles(styles)(VideoProject);

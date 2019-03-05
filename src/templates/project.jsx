import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ArrowBack from '@material-ui/icons/ArrowBack';
import VideoProject from '../components/Projects/VideoProject';
import TextProject from '../components/Projects/TextProject';

const Project = (props) => {
  const { classes, pageContext } = props;

  return (
    <div className={classes.container}>
      <div className={classes.topButton}>
        <Button
          component={Link}
          to="projects"
          variant="outlined"
          color="secondary"
          className={classes.backButton}
        >
          <ArrowBack className={classes.backArrow} />
          Go Back
        </Button>
      </div>

      {pageContext.link
        ? <VideoProject data={pageContext} />
        : <TextProject data={pageContext} />
      }

      <div className={classes.bottomButton}>
        <Button
          component={Link}
          to="projects"
          variant="contained"
          color="secondary"
        >
          View More Work
        </Button>
      </div>
    </div>
  );
};

Project.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  pageContext: PropTypes.shape({
    title: PropTypes.string,
    role: PropTypes.string,
    link: PropTypes.string,
    description: PropTypes.object,
    coverImage: PropTypes.object,
  }).isRequired,
};

const styles = theme => ({
  topButton: {
    marginBottom: theme.spacing.unit * 4,
  },
  container: {
    padding: `${theme.spacing.unit * 6}px ${theme.spacing.unit * 2}px`,
    [`@media (min-width: ${theme.breakpoints.values.xs}px)`]: {
      padding: `${theme.spacing.unit * 6}px 10vw`,
    },
  },
  bottomButton: {
    display: 'flex',
    justifyContent: 'center',
  },
});

export default withStyles(styles)(Project);

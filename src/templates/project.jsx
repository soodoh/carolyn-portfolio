import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import VideoProject from '../components/Projects/VideoProject';
import TextProject from '../components/Projects/TextProject';

const Project = (props) => {
  const { classes, pageContext } = props;

  return (
    <div className={classes.container}>
      {pageContext.link
        ? <VideoProject data={pageContext} />
        : <TextProject data={pageContext} />
      }
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
  container: {
    padding: `${theme.spacing.unit * 6}px ${theme.spacing.unit * 2}px`,
    [`@media (min-width: ${theme.breakpoints.values.xs}px)`]: {
      padding: `${theme.spacing.unit * 6}px 20vw`,
    },
  },
  title: {
    marginBottom: theme.spacing.unit * 3,
  },

});

export default withStyles(styles)(Project);

import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Metadata from '../components/common/Metadata';

const NotFound = (props) => {
  const { classes } = props;

  return (
    <React.Fragment>
      <Metadata
        title="CD: Page Not Found"
        robots="noindex, nofollow"
      />

      <div className={classes.container}>
        <Typography variant="h3" gutterBottom>
        404: Page Not Found
        </Typography>
        <Typography variant="h6">
        Please check your URL, or select something from the nav bar
        </Typography>
      </div>
    </React.Fragment>
  );
};

NotFound.propTypes = {
  classes: PropTypes.shape({
    container: PropTypes.string,
  }).isRequired,
};

const styles = theme => ({
  container: {
    padding: theme.spacing.unit * 2,
  },
});

export default withStyles(styles)(NotFound);

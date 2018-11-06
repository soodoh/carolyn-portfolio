import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const NotFound = (props) => {
  const { classes } = props;

  return (
    <div className={classes.container}>
      <Typography variant="h3" gutterBottom>
        404: Page Not Found
      </Typography>
      <Typography variant="h6">
        Please check your URL, or select something from the nav bar
      </Typography>
    </div>
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

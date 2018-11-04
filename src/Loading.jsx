import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';

const Loading = (props) => {
  const { classes, color } = props;

  return (
    <div className={classes.container}>
      <CircularProgress color={color} thickness={8} size={75} />
    </div>
  );
};

Loading.propTypes = {
  classes: PropTypes.shape({
    container: PropTypes.string,
  }).isRequired,
  color: PropTypes.string,
};
Loading.defaultProps = {
  color: 'primary',
};

const styles = theme => ({
  container: {
    marginTop: theme.spacing.unit * 4,
    display: 'flex',
    justifyContent: 'center',
    alignItem: 'center',
    width: '100%',
  },
});

export default withStyles(styles)(Loading);

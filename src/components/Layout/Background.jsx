import React from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import { withStyles } from '@material-ui/core/styles';

const BackgroundCore = (props) => {
  const { classes, sizes } = props;

  return (
    <div className={classes.container}>
      <Img
        fluid={sizes}
        className={classes.background}
        alt="Background Image"
      />
    </div>
  );
};
BackgroundCore.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  sizes: PropTypes.shape({}).isRequired,
};

const backgroundStyles = {
  container: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: -1,
  },
  background: {
    width: '100%',
    height: '100%',
  },
};
const Background = withStyles(backgroundStyles)(BackgroundCore);

export default Background;

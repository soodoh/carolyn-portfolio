import React from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
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
});

const Background = props => {
  const classes = useStyles();
  const { sizes } = props;

  return (
    <div className={classes.container}>
      <Img fluid={sizes} className={classes.background} alt="Background Image" />
    </div>
  );
};
Background.propTypes = {
  sizes: PropTypes.shape({}).isRequired,
};

export default Background;

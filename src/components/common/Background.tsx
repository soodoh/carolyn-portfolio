import React, { ReactElement } from 'react';
import Img, { FluidObject } from 'gatsby-image';
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

interface BackgroundProps {
  sizes: FluidObject | FluidObject[];
}

const Background = (props: BackgroundProps): ReactElement => {
  const classes = useStyles();
  const { sizes } = props;

  return (
    <div className={classes.container}>
      <Img fluid={sizes} className={classes.background} alt="Background Image" />
    </div>
  );
};

export default Background;

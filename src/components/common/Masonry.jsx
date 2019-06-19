import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/styles';
import Masonry from 'react-masonry-css';
import { uid } from 'react-uid';

const useStyles = makeStyles(theme => ({
  masonryContainer: {
    display: 'flex',
    padding: theme.spacing(0, 4),
    marginTop: theme.spacing(4),
    marginLeft: theme.spacing(-7),
    width: 'auto',
  },
  column: {
    paddingLeft: theme.spacing(7),
    backgroundClip: 'padding-box',
  },
  item: {
    marginBottom: theme.spacing(7),
  },
}));

const CustomMasonry = (props) => {
  const { children } = props;
  const classes = useStyles();
  const theme = useTheme();
  const breakpoints = {
    default: 4,
    [theme.breakpoints.values.lg]: 3,
    [theme.breakpoints.values.md]: 2,
    [theme.breakpoints.values.sm]: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpoints}
      className={classes.masonryContainer}
      columnClassName={classes.column}
    >
      {Array.isArray(children)
        ? children.map(child => (
          <div className={classes.item} key={uid(child)}>
            {child}
          </div>
        ))
        : (
          <div className={classes.item}>
            {children}
          </div>
        )
      }
    </Masonry>
  );
};

CustomMasonry.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
};

export default CustomMasonry;

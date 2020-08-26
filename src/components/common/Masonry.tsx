import React, { ReactElement } from 'react';
import { makeStyles, useTheme } from '@material-ui/styles';
import Masonry from 'react-masonry-css';

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

interface MasonryProps {
  children: { id: string; element: ReactElement }[];
}

const CustomMasonry = (props: MasonryProps): ReactElement => {
  const { children } = props;
  const classes = useStyles();
  const theme = useTheme();
  const breakpoints = {
    default: 4,
    [theme.breakpoints.values.xl]: 3,
    [theme.breakpoints.values.md]: 2,
    [theme.breakpoints.values.sm]: 1,
  };

  return (
    <Masonry breakpointCols={breakpoints} className={classes.masonryContainer} columnClassName={classes.column}>
      {Array.isArray(children) ? (
        children.map(({ id, element }) => (
          <div className={classes.item} key={id}>
            {element}
          </div>
        ))
      ) : (
        <div className={classes.item}>{children}</div>
      )}
    </Masonry>
  );
};

export default CustomMasonry;

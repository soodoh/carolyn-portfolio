import React, { ReactElement } from 'react';
import { makeStyles, useTheme } from '@material-ui/styles';
import Masonry from 'react-masonry-css';

const padding = '4rem';
const useStyles = makeStyles({
  masonryContainer: {
    display: 'flex',
    marginTop: '2rem',
    marginLeft: `-${padding}`,
    width: 'auto',
  },
  column: {
    paddingLeft: padding,
    backgroundClip: 'padding-box',
  },
  item: {
    marginBottom: padding,
  },
});

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

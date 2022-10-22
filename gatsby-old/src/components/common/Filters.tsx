import React, { ReactElement } from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { white, secondary } from '../Layout/theme';

const useStyles = makeStyles(theme => ({
  container: {
    position: 'sticky',
    zIndex: theme.zIndex.appBar + 1,
    width: '100%',
    height: '3rem',
    backgroundColor: white,
    top: theme.mixins.toolbar.minHeight,

    // Copied from the height of theme's Toolbar
    '@media (min-width:0px) and (orientation: landscape)': {
      top: theme.mixins.toolbar['@media (min-width:0px) and (orientation: landscape)'].minHeight,
    },
    '@media (min-width:600px)': {
      top: theme.mixins.toolbar['@media (min-width:600px)'].minHeight,
    },
  },
  bar: {
    display: 'flex',
    padding: 0,
    width: '100%',

    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  filter: {
    padding: `1rem 2rem`,
    cursor: 'pointer',
  },
  miniFilter: {
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  selected: {
    padding: `1rem 2rem`,
    marginTop: '-5px',
    borderTop: `5px solid ${secondary}`,
  },
}));

interface FiltersProps {
  list: string[];
  currentItem: string;
  onChange: (item: string) => void;
}

const Filters = (props: FiltersProps): ReactElement => {
  const { list, currentItem, onChange } = props;
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.bar}>
        {list.map(item => (
          <Typography
            key={item}
            onClick={() => onChange(item)}
            variant="subtitle1"
            color="primary"
            className={item === currentItem ? classes.selected : classes.filter}
          >
            {item}
          </Typography>
        ))}
      </div>

      <Select value={currentItem} onChange={(event: any) => onChange(event.target.value)} className={classes.miniFilter}>
        {list.map(item => (
          <MenuItem key={`filter-list-${item}`} value={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default Filters;

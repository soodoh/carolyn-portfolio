import React from 'react';
import PropTypes from 'prop-types';
import { uid } from 'react-uid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import Hidden from '@material-ui/core/Hidden';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const useStyles = makeStyles(theme => ({
  container: {
    position: 'sticky',
    zIndex: theme.zIndex.appBar + 1,
    width: '100%',
    height: theme.spacing(5),
    backgroundColor: theme.palette.common.white,
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
  },
  filter: {
    padding: `10px ${theme.spacing(4)}px`,
    cursor: 'pointer',
  },
  selected: {
    padding: `10px ${theme.spacing(4)}px`,
    marginTop: '-5px',
    borderTop: `5px solid ${theme.palette.secondary.main}`,
  },
}));

const Filters = (props) => {
  const {
    list, currentItem, onChange,
  } = props;
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Hidden only="xs">
        <div className={classes.bar}>
          {list.map((item, index) => (
            <Typography
              key={uid(item, index)}
              onClick={() => onChange(item)}
              variant="subtitle1"
              color="primary"
              className={item === currentItem ? classes.selected : classes.filter}
            >
              {item}
            </Typography>
          ))}
        </div>
      </Hidden>

      <Hidden smUp>
        <Select
          value={currentItem}
          onChange={event => onChange(event.target.value)}
        >
          {list.map((item, index) => (
            <MenuItem
              key={uid(item, list.length + index)}
              value={item}
            >
              {item}
            </MenuItem>
          ))}
        </Select>
      </Hidden>
    </div>
  );
};

Filters.propTypes = {
  list: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentItem: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Filters;

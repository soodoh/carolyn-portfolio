import React from 'react';
import PropTypes from 'prop-types';
import { uid } from 'react-uid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const Filter = (props) => {
  const {
    list, currentItem, onChange, classes,
  } = props;

  return (
    <div className={classes.container}>
      <Hidden only="xs">
        <div className={classes.bar}>
          {list.map(item => (
            <Typography
              key={`${uid(item)}-title`}
              onClick={() => onChange(item)}
              variant="subheading"
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
          {list.map(item => (
            <MenuItem value={item} key={`${uid(item)}-menu`}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </Hidden>
    </div>
  );
};

Filter.propTypes = {
  list: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentItem: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  classes: PropTypes.shape({
    container: PropTypes.string,
    bar: PropTypes.string,
    filter: PropTypes.string,
    selected: PropTypes.string,
  }).isRequired,
};

const styles = theme => ({
  container: {
    position: 'sticky',
    zIndex: theme.zIndex.appBar + 1,
    width: '100%',
    height: theme.spacing.unit * 5,
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
    padding: `10px ${theme.spacing.unit * 4}px`,
    cursor: 'pointer',
  },
  selected: {
    padding: `10px ${theme.spacing.unit * 4}px`,
    marginTop: '-5px',
    borderTop: `5px solid ${theme.palette.secondary.main}`,
  },
});

export default withStyles(styles)(Filter);

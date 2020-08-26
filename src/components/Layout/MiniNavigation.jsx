import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import { makeStyles } from '@material-ui/styles';
import MenuIcon from '@material-ui/icons/Menu';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import ArrowRight from '@material-ui/icons/ChevronRight';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const useStyles = makeStyles(theme => ({
  navMenu: {
    backgroundColor: 'transparent',
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: '2px',

    '&:focus': {
      backgroundColor: 'transparent',
    },
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  list: {
    width: theme.spacing(30),
  },
  listText: {
    fontFamily: theme.typography.fontFamily,
    padding: '1rem 0',
  },
  drawerTop: {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: theme.spacing(0.5),
  },
}));

const MiniNavigation = props => {
  const { location, links } = props;
  const classes = useStyles();
  const [isActive, setActive] = useState(false);

  return (
    <>
      <Fab size="small" color="secondary" classes={{ root: classes.navMenu }} onClick={() => setActive(true)}>
        <MenuIcon />
      </Fab>

      <Drawer anchor="right" open={isActive} onClose={() => setActive(false)}>
        <div className={classes.drawerTop}>
          <IconButton color="primary" onClick={() => setActive(false)}>
            <ArrowRight />
          </IconButton>
        </div>

        <List className={classes.list}>
          {links.map(({ label, path, external }) => (
            <ListItem
              key={`mobile-${label}`}
              button
              divider
              selected={location.pathname === path}
              color="primary"
              onClick={() => setActive(false)}
              component={external ? 'a' : Link}
              href={path}
              to={path}
            >
              <ListItemText primary={label} classes={{ primary: classes.listText }} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

MiniNavigation.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      external: PropTypes.bool,
    }),
  ).isRequired,
};

export default MiniNavigation;

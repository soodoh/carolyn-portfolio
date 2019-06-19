import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import { makeStyles } from '@material-ui/styles';
import MenuIcon from 'mdi-material-ui/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Fab from '@material-ui/core/Fab';
import Typography from '@material-ui/core/Typography';

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
  menuLink: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
  },
}));

const MiniNavigation = (props) => {
  const { links } = props;
  const classes = useStyles();
  const [menuAnchor, setAnchor] = useState(null);

  return (
    <React.Fragment>
      <Fab
        size="small"
        aria-owns={menuAnchor ? 'Navigation' : null}
        aria-haspopup="true"
        aria-label="Navigation Menu"
        color="secondary"
        classes={{ root: classes.navMenu }}
        onClick={event => setAnchor(event.currentTarget)}
      >
        <MenuIcon />
      </Fab>

      <Menu
        id="Navigation"
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onEnter={() => document.activeElement.blur()}
        onClose={() => setAnchor(null)}
      >
        {links.map(({ external, path, label }) => (
          <MenuItem
            {...external ? { href: path } : { to: path }}
            component={external ? 'a' : Link}
            onClick={() => setAnchor(null)}
          >
            <Typography variant="subtitle1" color="inherit">{label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  );
};

MiniNavigation.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      component: PropTypes.string,
    }),
  ).isRequired,
};

export default MiniNavigation;

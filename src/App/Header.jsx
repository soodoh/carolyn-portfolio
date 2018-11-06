import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Hidden from '@material-ui/core/Hidden';
import MenuIcon from 'mdi-material-ui/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import logo from '../assets/logo.svg';

class Header extends React.Component {
  constructor(props) {
    super(props);

    const { match } = this.props;
    this.state = {
      isTransparent: match.path === '/' || match.path.match(/about/gi),
      hideBrand: match.path === '/',
      menuAnchor: null,
    };
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentWillMount() {
    const { match } = this.props;

    if (match.path === '/') { document.addEventListener('scroll', this.handleScroll); } else { this.setState({ isTransparent: false, hideBrand: false }); }
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    const breakpoint = window.innerHeight - 60;

    if (breakpoint < window.scrollY) { this.setState({ isTransparent: false, hideBrand: false }); } else { this.setState({ isTransparent: true, hideBrand: true }); }
  }

  render() {
    const { classes, match } = this.props;
    const { isTransparent, hideBrand, menuAnchor } = this.state;

    const NavLinks = [
      { label: 'About.', path: '/about' },
      { label: 'Projects.', path: '/projects' },
      { label: 'Photography.', path: '/photography' },
      { label: 'Resume.', path: '/resume' },
    ];

    return (
      <AppBar
        position={match.path === '/' ? 'fixed' : 'sticky'}
        className={isTransparent ? classes.transparent : classes.appBar}
      >
        <Toolbar>
          {hideBrand ? <div className={classes.brand} />
            : (
              <div className={classes.brand}>
                <NavLink to="/">
                  <img
                    className={classes.logo}
                    src={logo}
                    alt="CD Logo"
                  />
                </NavLink>
                <Hidden only="xs">
                  <Typography
                    variant="h2"
                    color="inherit"
                    className={classes.name}
                  >
                    Carolyn DiLoreto
                  </Typography>
                </Hidden>
              </div>
            )
          }

          <Hidden smDown>
            {NavLinks.map(link => (
              <NavLink
                to={link.path}
                key={link.path}
                className={classes.link}
                activeClassName={classes.active}
              >
                <Typography variant="subtitle1" color="inherit">{link.label}</Typography>
              </NavLink>
            ))}
          </Hidden>
          <Hidden mdUp>
            <Button
              variant="fab"
              mini
              aria-owns={menuAnchor ? 'Navigation' : null}
              aria-haspopup="true"
              color="secondary"
              classes={{ root: classes.navMenu }}
              onClick={event => this.setState({ menuAnchor: event.currentTarget })}
            >
              <MenuIcon />
            </Button>

            <Menu
              id="Navigation"
              anchorEl={menuAnchor}
              open={!!menuAnchor}
              onEnter={() => document.activeElement.blur()}
              onClose={() => this.setState({ menuAnchor: null })}
            >
              {NavLinks.map(link => (
                <NavLink
                  to={link.path}
                  key={link.path}
                  className={classes.menuLink}
                >
                  <MenuItem onClick={() => this.setState({ menuAnchor: null })}>
                    <Typography variant="subtitle1" color="inherit">{link.label}</Typography>
                  </MenuItem>
                </NavLink>
              ))}
            </Menu>
          </Hidden>
        </Toolbar>
      </AppBar>
    );
  }
}

Header.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
  classes: PropTypes.shape({
    brand: PropTypes.string,
  }).isRequired,
};

const styles = theme => ({
  brand: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    color: theme.palette.primary.contrastText,
    textDecoration: 'none',
  },
  appBar: {
    transition: `background-color ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`,
    boxShadow: 'none',
  },
  transparent: {
    transition: `background-color ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`,
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
  name: {
    fontSize: '2rem',
    lineHeight: '1rem',
    paddingLeft: theme.spacing.unit * 4,
  },
  logo: {
    height: '3rem',
  },
  link: {
    color: theme.palette.primary.contrastText,
    textDecoration: 'none',
    paddingLeft: theme.spacing.unit * 4,
  },
  active: {
    color: theme.palette.secondary.main,
    fontWeight: 'bold',
  },
  navMenu: {
    backgroundColor: 'transparent',
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: '2px',

    '&:focus': {
      backgroundColor: 'transparent',
    },
  },
  menuLink: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
  },
});

export default withStyles(styles)(Header);

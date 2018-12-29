import React from 'react';
import PropTypes from 'prop-types';
import { Link, StaticQuery, graphql } from 'gatsby';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Hidden from '@material-ui/core/Hidden';
import MenuIcon from 'mdi-material-ui/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Fab from '@material-ui/core/Fab';
import { withStyles } from '@material-ui/core/styles';
import logo from '../../../static/logo.svg';

class HeaderCore extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.handleScroll = this.handleScroll.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { location } = nextProps;
    const { prevLocation } = prevState;

    if (location === prevLocation) return null;

    return {
      prevLocation: location,
      isTransparent: location.pathname === '/'
        || location.pathname.match(/about/gi),
      hideBrand: location.pathname === '/',
      menuAnchor: null,
    };
  }

  componentDidMount() {
    document.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    const { location } = this.props;
    const breakpoint = window.innerHeight - 60;

    if (location.pathname !== '/') {
      return null;
    } if (breakpoint >= window.scrollY) {
      this.setState({
        isTransparent: true,
        hideBrand: true,
      });
    } else {
      this.setState({
        isTransparent: false,
        hideBrand: false,
      });
    }
    return true;
  }

  render() {
    const { classes, resume, location } = this.props;
    const { isTransparent, hideBrand, menuAnchor } = this.state;

    const NavLinks = [
      { label: 'About.', path: '/about' },
      { label: 'Projects.', path: '/projects' },
      { label: 'Photography.', path: '/photography' },
      { label: 'Resume.', path: resume, external: true },
    ];

    return (
      <AppBar
        position={location.pathname === '/' ? 'fixed' : 'sticky'}
        className={isTransparent ? classes.transparent : classes.appBar}
      >
        <Toolbar>
          {hideBrand
            ? <div className={classes.brand} />
            : (
              <div className={classes.brand}>
                <Link to="/">
                  <img
                    className={classes.logo}
                    src={logo}
                    alt="CD Logo"
                  />
                </Link>
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
            {NavLinks.map((link) => {
              if (link.external) {
                return (
                  <a
                    key={link.path}
                    href={link.path}
                    className={classes.link}
                    style={{ textDecoration: 'none' }}
                  >
                    <Typography variant="subtitle1" color="inherit">{link.label}</Typography>
                  </a>
                );
              }
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={classes.link}
                  activeClassName={classes.active}
                >
                  <Typography variant="subtitle1" color="inherit">{link.label}</Typography>
                </Link>
              );
            })}
          </Hidden>
          <Hidden mdUp>
            <Fab
              size="small"
              aria-owns={menuAnchor ? 'Navigation' : null}
              aria-haspopup="true"
              aria-label="Navigation Menu"
              color="secondary"
              classes={{ root: classes.navMenu }}
              onClick={event => this.setState({ menuAnchor: event.currentTarget })}
            >
              <MenuIcon />
            </Fab>

            <Menu
              id="Navigation"
              anchorEl={menuAnchor}
              open={!!menuAnchor}
              onEnter={() => document.activeElement.blur()}
              onClose={() => this.setState({ menuAnchor: null })}
            >
              {NavLinks.map((link) => {
                if (link.external) {
                  return (
                    <a
                      key={link.path}
                      href={link.path}
                      style={{ textDecoration: 'none' }}
                    >
                      <MenuItem onClick={() => this.setState({ menuAnchor: null })}>
                        <Typography variant="subtitle1" color="inherit">{link.label}</Typography>
                      </MenuItem>
                    </a>
                  );
                }
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={classes.menuLink}
                  >
                    <MenuItem onClick={() => this.setState({ menuAnchor: null })}>
                      <Typography variant="subtitle1" color="inherit">{link.label}</Typography>
                    </MenuItem>
                  </Link>
                );
              })}
            </Menu>
          </Hidden>
        </Toolbar>
      </AppBar>
    );
  }
}

HeaderCore.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  classes: PropTypes.shape({
    brand: PropTypes.string,
  }).isRequired,
  resume: PropTypes.string.isRequired,
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

const HeaderWithStyles = withStyles(styles)(HeaderCore);

const Header = (props) => {
  const { location } = props;

  return (
    <StaticQuery
      query={graphql`
        query HeaderQuery {
          contentfulAbout {
            resume {
              file {
                url
              }
            }
          }
        }
      `}
      render={data => (
        <HeaderWithStyles
          location={location}
          resume={data.contentfulAbout.resume.file.url}
        />
      )}
    />
  );
};

Header.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export default Header;

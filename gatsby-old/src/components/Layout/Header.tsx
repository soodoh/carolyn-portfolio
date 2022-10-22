import React, { ReactElement, useState, useEffect } from 'react';
import { Link, StaticQuery, graphql } from 'gatsby';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import logo from '../../../static/logo.svg';
import MobileNavMenu from './MobileNavMenu';
import { white, secondary, headerFont } from '../Layout/theme';

const useStyles = makeStyles(theme => ({
  brand: {
    display: 'flex',
    flex: 1,
    alignItems: 'flex-end',
    color: white,
    textDecoration: 'none',
    opacity: 1,
    transition: `opacity 250ms ease-in-out`,
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'center',
    },
  },
  hideBrand: {
    opacity: 0,
    transition: `opacity 250ms ease-in-out`,
  },
  appBar: {
    transition: `background-color 250ms ease-in-out`,
    boxShadow: 'none',
    left: 0,
    right: 0,
  },
  transparent: {
    transition: `background-color 250ms ease-in-out`,
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
  name: {
    fontSize: '2rem',
    lineHeight: '2rem',
    paddingLeft: '2rem',
    fontFamily: headerFont,
    fontWeight: 'normal',
    margin: 0,
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.5rem',
      lineHeight: '1.5rem',
      paddingLeft: '0',
    },
  },
  logo: {
    height: '3rem',
    [theme.breakpoints.down('xs')]: {
      height: '2rem',
    },
  },
  mobileNav: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  link: {
    color: white,
    textDecoration: 'none',
    paddingLeft: '2rem',

    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  active: {
    color: secondary,
    fontWeight: 'bold',
  },
}));

interface HeaderProps {
  resume: string;
  location: { pathname: string };
}

const Header = (props: HeaderProps): ReactElement => {
  const classes = useStyles();
  const { resume, location } = props;
  const initialTransparency = location.pathname === '/';
  const [isTransparent, setTransparent] = useState(initialTransparency);
  const [showBrand, setBrand] = useState(location.pathname !== '/');

  const handleScroll = () => {
    const breakpoint = window.innerHeight - 60;

    if (location.pathname !== '/') return;
    if (breakpoint >= window.scrollY) {
      setTransparent(true);
      setBrand(false);
    } else {
      setTransparent(false);
      setBrand(true);
    }
  };

  useEffect(() => {
    // Change style for different routes
    setTransparent(initialTransparency);
    setBrand(location.pathname !== '/');

    // Add scroll event listeners
    if (location.pathname === '/') {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (location.pathname === '/') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [location]);

  const links = [
    { label: 'About.', path: '/about' },
    { label: 'Projects.', path: '/projects' },
    { label: 'Photography.', path: '/photography' },
    { label: 'Resume.', path: resume, external: true },
  ];

  return (
    <AppBar position={location.pathname === '/' ? 'fixed' : 'sticky'} className={isTransparent ? classes.transparent : classes.appBar}>
      <Toolbar>
        <Link to="/" className={`${classes.brand} ${!showBrand && classes.hideBrand}`}>
          <img className={classes.logo} src={logo} alt="CD Logo" />
          <h2 className={classes.name}>Carolyn DiLoreto</h2>
        </Link>

        {links.map(link => {
          if (link.external) {
            return (
              <a key={link.path} href={link.path} className={classes.link} style={{ textDecoration: 'none' }}>
                <Typography variant="subtitle1" color="inherit">
                  {link.label}
                </Typography>
              </a>
            );
          }
          return (
            <Link key={link.path} to={link.path} className={classes.link} activeClassName={classes.active}>
              <Typography variant="subtitle1" color="inherit">
                {link.label}
              </Typography>
            </Link>
          );
        })}

        <div className={classes.mobileNav}>
          <MobileNavMenu location={location} links={links} />
        </div>
      </Toolbar>
    </AppBar>
  );
};

interface LocationProps {
  location: { pathname: string };
}
const HeaderWithData = (props: LocationProps): ReactElement => {
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
      render={data => <Header location={props.location} resume={data.contentfulAbout.resume.file.url} />}
    />
  );
};

export default HeaderWithData;

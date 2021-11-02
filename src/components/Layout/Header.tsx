import React, { ReactElement, useState, useEffect } from 'react';
import { Link, StaticQuery, graphql } from 'gatsby';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import logo from '../../../static/logo.svg';
import MiniNavigation from './MiniNavigation';
import { white, secondary } from '../Layout/theme';

const useStyles = makeStyles(theme => ({
  brand: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    color: white,
    textDecoration: 'none',
    opacity: 1,
    transition: `opacity 250ms ease-in-out`,
  },
  hideBrand: {
    opacity: 0,
    transition: `opacity 250ms ease-in-out`,
  },
  appBar: {
    transition: `background-color 250ms ease-in-out`,
    boxShadow: 'none',
  },
  transparent: {
    transition: `background-color 250ms ease-in-out`,
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
  name: {
    fontSize: '2rem',
    lineHeight: '1rem',
    paddingLeft: '2rem',

    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  logo: {
    height: '3rem',
  },
  link: {
    color: white,
    textDecoration: 'none',
    paddingLeft: '2rem',

    [theme.breakpoints.down('xs')]: {
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
  const initialTransparency = location.pathname === '/' || /about/gi.test(location.pathname);
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
        <div className={`${classes.brand} ${!showBrand && classes.hideBrand}`}>
          <Link to="/">
            <img className={classes.logo} src={logo} alt="CD Logo" />
          </Link>
          <Typography variant="h2" color="inherit" className={classes.name}>
            Carolyn DiLoreto
          </Typography>
        </div>

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

        <MiniNavigation location={location} links={links} />
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

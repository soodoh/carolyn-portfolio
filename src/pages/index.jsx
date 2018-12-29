import React from 'react';
import PropTypes from 'prop-types';
import { Link, StaticQuery, graphql } from 'gatsby';
import Img from 'gatsby-image';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Metadata from '../components/Layout/Metadata';
import logo from '../../static/logo.svg';
import Projects from '../components/Projects/Projects';

const HomeCore = (props) => {
  const { classes, background } = props;

  return (
    <React.Fragment>
      <Metadata
        title="CD Portfolio"
        description="Carolyn DiLoreto is a multi-media visual artist, dancer and USC alumnus. In this portfolio, view photo galleries, read about past projects, or even read her bio."
      />

      <section className={classes.home}>
        <div className={classes.backgroundContainer}>
          <Img
            fluid={background}
            className={classes.background}
            alt="Background Image"
          />
        </div>

        <img
          src={logo}
          alt="CD Logo"
          className={classes.logo}
        />
        <Typography
          variant="h6"
          color="inherit"
          className={classes.title}
          gutterBottom
        >
          Carolyn DiLoreto
        </Typography>

        <div className={classes.buttonGroup}>
          <Link to="/photography" className={classes.link}>
            <Button
              variant="outlined"
              color="secondary"
              className={classes.button}
              aria-label="Photography"
            >
              View Photography
            </Button>
          </Link>

          <Link to="/projects" className={classes.link}>
            <Button
              variant="outlined"
              color="secondary"
              className={classes.button}
              aria-label="Projects"
            >
              View Projects
            </Button>
          </Link>
        </div>
      </section>

      <section className={classes.projectsContainer}>
        <Projects isComponent />
      </section>
    </React.Fragment>

  );
};

HomeCore.propTypes = {
  classes: PropTypes.shape({
    home: PropTypes.string,
    buttonGroup: PropTypes.string,
  }).isRequired,
  background: PropTypes.shape({}).isRequired,
};

const styles = theme => ({
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -99,
  },
  background: {
    height: '100%',
  },
  home: {
    height: '100vh',
    color: theme.palette.primary.contrastText,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectsContainer: {
    marginTop: '-5px',
    paddingTop: '5px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '28rem',
  },
  button: {
    border: `1px solid ${theme.palette.secondary.main}`,
    textTransform: 'none',

    '&:hover': {
      transition: theme.transitions.easing,
      color: theme.palette.common.black,
      backgroundColor: theme.palette.secondary.main,
    },
  },
  link: {
    textDecoration: 'none',
  },
  logo: {
    height: '15rem',
    marginBottom: theme.spacing.unit * 2,
  },
  title: {
    fontSize: '3.5rem',
  },
  [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
    title: {
      fontSize: '2rem',
    },
    buttonGroup: {
      width: '85vw',
    },
  },
});

const HomeWithStyles = withStyles(styles)(HomeCore);

export default () => (
  <StaticQuery
    query={graphql`
      query HomeQuery {
        contentfulAbout {
          background {
            fluid(maxWidth: 1920) {
              ...GatsbyContentfulFluid_withWebp
            }
          }
        }
      }
    `}
    render={data => (
      <HomeWithStyles background={data.contentfulAbout.background.fluid} />
    )}
  />
);

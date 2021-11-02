import React, { ReactElement } from 'react';
import { Link, StaticQuery, graphql } from 'gatsby';
import Img, { FluidObject } from 'gatsby-image';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/styles';
import Metadata from '../components/common/Metadata';
import logo from '../../static/logo.svg';
import Projects from '../components/Projects/Projects';

const useStyles = makeStyles(theme => ({
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
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

    '&:hover': {
      transition: theme.transitions.easing,
      color: theme.palette.common.black,
      backgroundColor: theme.palette.secondary.main,
    },
  },
  logo: {
    height: '15rem',
    marginBottom: theme.spacing(2),
  },
  title: {
    fontSize: '3.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    title: {
      fontSize: '2rem',
    },
    buttonGroup: {
      width: '85vw',
    },
  },
}));

interface HomeProps {
  background: FluidObject;
}

const Home = (props: HomeProps): ReactElement => {
  const { background } = props;
  const classes = useStyles();

  return (
    <>
      <Metadata
        title="CD Portfolio"
        description="Carolyn DiLoreto is a multi-media visual artist, dancer and USC alumnus. In this portfolio, view photo galleries, read about past projects, or even read her bio."
      />

      <section className={classes.home}>
        <div className={classes.backgroundContainer}>
          <Img fluid={background} className={classes.background} alt="Background Image" />
        </div>

        <img src={logo} alt="CD Logo" className={classes.logo} />
        <Typography variant="h3" color="inherit" className={classes.title} gutterBottom>
          Carolyn DiLoreto
        </Typography>

        <div className={classes.buttonGroup}>
          <Button
            component={Link}
            to="/photography"
            variant="outlined"
            color="secondary"
            className={classes.button}
            aria-label="Photography"
          >
            View Photography
          </Button>

          <Button component={Link} to="/projects" variant="outlined" color="secondary" className={classes.button} aria-label="Projects">
            View Projects
          </Button>
        </div>
      </section>

      <section className={classes.projectsContainer}>
        <Projects />
      </section>
    </>
  );
};

const HomeWithData = (): ReactElement => (
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
    render={data => <Home background={data.contentfulAbout.background.fluid} />}
  />
);
export default HomeWithData;

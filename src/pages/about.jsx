import React from 'react';
import PropTypes from 'prop-types';
import { StaticQuery, graphql } from 'gatsby';
import Img from 'gatsby-image';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import Metadata from '../components/common/Metadata';
import SocialMedia from '../components/common/SocialMedia';
import Background from '../components/common/Background';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    display: 'grid',
    gridTemplateColumns: '25% 75%',

    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '40% 60%',
    },
    [theme.breakpoints.down('xs')]: {
      gridTemplateColumns: '100%',
    },
  },
  content: {
    ...theme.typography.body1,
    padding: theme.spacing(2),
    color: theme.palette.primary.contrastText,
    marginBottom: '1.5rem',

    '& a': {
      color: theme.palette.primary.contrastText,
    },
  },
  profile: {
    boxSizing: 'border-box',
    border: `${theme.spacing(2)}px solid ${theme.palette.secondary.main}`,
    width: '100%',
  },
}));

const About = (props) => {
  const { data } = props;
  const classes = useStyles();

  return (
    <>
      <Metadata
        title="About Carolyn"
        description="Carolyn DiLoreto is a multi-media visual artist, dancer, and USC alumnus, with a Media Arts + Practice major and a double minor in Dance and Computer Programming."
      />

      <div className={classes.container}>
        <Background sizes={data.background.fluid} />

        <div className={classes.content}>
          <Img
            fluid={data.profilePicture.fluid}
            alt="Headshot"
            className={classes.profile}
          />
          <Typography
            variant="body2"
            color="secondary"
            align="center"
          >
            {data.location}
          </Typography>
          <Typography
            variant="body2"
            color="secondary"
            align="center"
          >
            {data.email}
          </Typography>
          {/* <Typography
              variant="body2"
              color="secondary"
              align="center"
            >
              {data.phoneNumber}
            </Typography> */}

          <SocialMedia color="secondary" align="center" />
        </div>

        <div
          className={classes.content}
              // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: data.bio.childMarkdownRemark.html }}
        />
      </div>
    </>
  );
};

About.propTypes = {
  data: PropTypes.shape({
    background: PropTypes.shape({
      fluid: PropTypes.shape({}),
    }).isRequired,
    profilePicture: PropTypes.shape({
      fluid: PropTypes.shape({}),
    }).isRequired,
    bio: PropTypes.shape({
      childMarkdownRemark: PropTypes.shape({
        html: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    location: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
};

export default () => (
  <StaticQuery
    query={graphql`
      query AboutQuery {
        contentfulAbout {
          location
          email
          background {
            fluid(maxWidth: 1920) {
              ...GatsbyContentfulFluid_withWebp
            }
          }
          bio {
            childMarkdownRemark {
              html
            }
          }
          profilePicture {
            fluid(maxWidth: 600) {
              ...GatsbyContentfulFluid_withWebp
            }
          }
        }
      }
    `}
    render={(data) => (
      <About
        data={data.contentfulAbout}
      />
    )}
  />
);

import React from 'react';
import PropTypes from 'prop-types';
import { StaticQuery, graphql } from 'gatsby';
import Img from 'gatsby-image';
import { makeStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Metadata from '../components/common/Metadata';
import SocialMedia from '../components/common/SocialMedia';
import Background from '../components/common/Background';

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(2),
  },
  content: {
    ...theme.typography.body1,
    padding: theme.spacing(2),
    color: theme.palette.primary.contrastText,

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
    <React.Fragment>
      <Metadata
        title="About Carolyn"
        description="Carolyn DiLoreto is a multi-media visual artist, dancer, and USC alumnus, with a Media Arts + Practice major and a double minor in Dance and Computer Programming."
      />

      <div className={classes.container}>
        <Background sizes={data.background.fluid} />

        <Grid container>
          <Grid item xs={12} sm={5} md={3} className={classes.content}>
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
          </Grid>

          <Grid item xs={12} sm={7} md={9}>
            <div
              className={classes.content}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: data.bio.childMarkdownRemark.html }}
            />
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  );
};

About.propTypes = {
  data: PropTypes.shape({}).isRequired,
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
    render={data => (
      <About
        data={data.contentfulAbout}
      />
    )}
  />
);

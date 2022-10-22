import React, { ReactElement } from 'react';
import { StaticQuery, graphql } from 'gatsby';
import Img, { GatsbyImageFluidProps } from 'gatsby-image';
import { makeStyles } from '@material-ui/styles';
import Metadata from '../components/common/Metadata';
import SocialMedia from '../components/common/SocialMedia';
import Background from '../components/common/Background';
import { Markdown } from '../types';
import { headerFont, white, bodyFont, secondary } from '../components/Layout/theme';

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: '1.5rem',
    display: 'grid',
    gridTemplateColumns: '25% 1fr',
    gridGap: '3rem',

    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '40% 1fr',
    },
    [theme.breakpoints.down('xs')]: {
      gridTemplateColumns: '100%',
    },
  },
  content: {
    fontSize: '1.25rem',
    fontFamily: headerFont,
    color: white,
    marginBottom: '1.5rem',

    '& a': {
      color: white,
    },
    '& p': {
      margin: '0 0 2rem 0',
    },
  },
  contact: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: bodyFont,
    color: secondary,
    fontSize: '1rem',
  },
  profile: {
    boxSizing: 'border-box',
    border: `1.5rem solid ${secondary}`,
    width: '100%',
    marginBottom: '1rem',
  },
}));

interface AboutProps {
  data: {
    location: string;
    email: string;
    background: GatsbyImageFluidProps;
    bio: Markdown;
    profilePicture: GatsbyImageFluidProps;
  };
}

const About = (props: AboutProps): ReactElement => {
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
          <Img fluid={data.profilePicture.fluid} alt="Headshot" className={classes.profile} />
          <div className={classes.contact}>
            <span>{data.location}</span>
            <span>{data.email}</span>
            <SocialMedia color={secondary} />
          </div>
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

const AboutWithData = (): ReactElement => (
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
    render={data => <About data={data.contentfulAbout} />}
  />
);
export default AboutWithData;

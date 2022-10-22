import React, { ReactElement } from 'react';
import { StaticQuery, graphql } from 'gatsby';
import SVG from 'react-inlinesvg';
import { makeStyles } from '@material-ui/styles';
import IconButton from '@material-ui/core/IconButton';
import { primary } from '../Layout/theme';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
});

interface SocialMediaLink {
  id: string;
  title: string;
  link: string;
  icon: { file: { url: string } };
}

interface SocialMediaProps {
  color?: string;
  icons: SocialMediaLink[];
}

const SocialMedia = (props: SocialMediaProps): ReactElement => {
  const { color = primary, icons } = props;
  const classes = useStyles();

  return (
    <div className={classes.container}>
      {icons.map(icon => (
        <a key={icon.id} href={icon.link} style={{ color }}>
          <IconButton style={{ color }} aria-label={icon.title}>
            <SVG src={icon.icon.file.url} style={{ fill: color }} />
          </IconButton>
        </a>
      ))}
    </div>
  );
};

const SocialMediaWithData = (props: { color?: string }): ReactElement => {
  return (
    <StaticQuery
      query={graphql`
        query SocialMediaQuery {
          allContentfulSocialMedia {
            edges {
              node {
                id
                icon {
                  file {
                    url
                    contentType
                  }
                }
                link
                title
              }
            }
          }
        }
      `}
      render={data => (
        <SocialMedia color={props.color} icons={data.allContentfulSocialMedia.edges.map((item: { node: SocialMediaLink }) => item.node)} />
      )}
    />
  );
};

export default SocialMediaWithData;

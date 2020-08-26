import React from 'react';
import PropTypes from 'prop-types';
import { uid } from 'react-uid';
import { StaticQuery, graphql } from 'gatsby';
import SVG from 'react-inlinesvg';
import { makeStyles, useTheme } from '@material-ui/styles';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
});

const SocialMedia = props => {
  const { color, icons } = props;
  const classes = useStyles();
  const theme = useTheme();
  const colorCode = color ? theme.palette[color].main : theme.palette.gray[700];

  return (
    <div className={classes.container}>
      {icons.map(icon => (
        <a key={uid(icon)} href={icon.link} style={{ color: 'inherit' }}>
          <IconButton color={color || 'inherit'} aria-label={icon.title}>
            <SVG src={icon.icon.file.url} style={{ fill: colorCode }} />
          </IconButton>
        </a>
      ))}
    </div>
  );
};

SocialMedia.propTypes = {
  icons: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      link: PropTypes.string,
      icon: PropTypes.shape({
        file: PropTypes.shape({
          url: PropTypes.string,
        }),
      }),
    }),
  ).isRequired,
  color: PropTypes.string,
};
SocialMedia.defaultProps = {
  color: '',
};

const SocialMediaWithData = props => {
  const { color } = props;

  return (
    <StaticQuery
      query={graphql`
        query SocialMediaQuery {
          allContentfulSocialMedia {
            edges {
              node {
                icon {
                  id
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
      render={data => <SocialMedia color={color} icons={data.allContentfulSocialMedia.edges.map(item => item.node)} />}
    />
  );
};

SocialMediaWithData.propTypes = {
  color: PropTypes.string,
};
SocialMediaWithData.defaultProps = {
  color: '',
};

export default SocialMediaWithData;

import React from 'react';
import PropTypes from 'prop-types';
import { uid } from 'react-uid';
import { StaticQuery, graphql } from 'gatsby';
import SVG from 'react-inlinesvg';
import { withStyles, withTheme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';

const SocialMediaCore = (props) => {
  const {
    classes, theme, color, icons,
  } = props;
  const colorCode = color ? theme.palette[color].main : theme.palette.gray[700];

  return (
    <div className={classes.container}>
      {icons.map(icon => (
        <a
          key={uid(icon)}
          href={icon.link}
          style={{ color: 'inherit' }}
        >
          <IconButton
            color={color || 'inherit'}
            aria-label={icon.title}
          >
            <SVG
              src={icon.icon.file.url}
              style={{ fill: colorCode }}
            />
          </IconButton>
        </a>
      ))}
    </div>
  );
};

SocialMediaCore.propTypes = {
  classes: PropTypes.shape({
    container: PropTypes.string,
  }).isRequired,
  theme: PropTypes.shape({
    palette: PropTypes.object.isRequired,
  }).isRequired,
  icons: PropTypes.arrayOf(
    PropTypes.object,
  ).isRequired,
  color: PropTypes.string,
};
SocialMediaCore.defaultProps = {
  color: '',
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
};

const SocialMedia = withTheme()(withStyles(styles)(SocialMediaCore));

export default props => (
  <StaticQuery
    query={graphql`
      query SocialMediaQuery {
        allContentfulSocialMedia{
          edges{
            node{
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
    render={data => (
      <SocialMedia
        {...props}
        icons={
          data.allContentfulSocialMedia.edges.map(item => item.node)
        }
      />
    )}
  />
);

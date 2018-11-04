import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, withTheme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import SVG from 'react-inlinesvg';
import Keys from './env';

class SocialMedia extends React.Component {
  constructor(props) {
    super(props);

    // eslint-disable-next-line global-require
    const Contentful = require('contentful');
    this.client = Contentful.createClient(Keys);
    this.state = { icons: [] };
  }

  componentDidMount() {
    this.client.getEntries({ content_type: 'socialMedia' }).then((res) => {
      this.setState({
        icons: res.items,
      });
    });
  }

  render() {
    const { classes, theme, color } = this.props;
    const { icons } = this.state;
    const colorCode = color ? theme.palette[color].main : theme.palette.gray[700];

    return (
      <div className={classes.container}>
        {icons.map(icon => (
          <a
            href={icon.fields.link}
            style={{ color: 'inherit' }}
            key={icon.fields.link}
          >
            <IconButton color={color || 'inherit'}>
              <SVG
                src={icon.fields.icon.fields.file.url}
                style={{ fill: colorCode }}
              />
            </IconButton>
          </a>
        ))}
      </div>
    );
  }
}

SocialMedia.propTypes = {
  classes: PropTypes.shape({
    container: PropTypes.string,
  }).isRequired,
  theme: PropTypes.shape({
    palette: PropTypes.object.isRequired,
  }).isRequired,
  color: PropTypes.string,
};
SocialMedia.defaultProps = {
  color: '',
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
};

export default withTheme()(withStyles(styles)(SocialMedia));

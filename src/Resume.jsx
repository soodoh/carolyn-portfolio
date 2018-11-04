import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Loading from './Loading';
import Keys from './env';

class Resume extends React.Component {
  constructor(props) {
    super(props);

    // eslint-disable-next-line global-require
    const Contentful = require('contentful');
    this.client = Contentful.createClient(Keys);
    this.state = { loading: true };
  }

  componentDidMount() {
    this.client.getEntries({ content_type: 'about' }).then((res) => {
      this.setState({
        resume: res.items[0].fields.resume.fields.file.url,
        loading: false,
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { loading, resume } = this.state;

    if (loading) { return <Loading />; }

    return (
      <div>
        <object
          data={resume}
          type="application/pdf"
          className={classes.resume}
        >
          <a href={resume}>CD_Resume.pdf</a>
        </object>
      </div>
    );
  }
}

Resume.propTypes = {
  classes: PropTypes.shape({
    resume: PropTypes.string,
  }).isRequired,
};

const styles = theme => ({
  resume: {
    width: '100%',
    height: `calc(100vh - ${theme.spacing.unit * 20}px)`,
  },
});

export default withStyles(styles)(Resume);

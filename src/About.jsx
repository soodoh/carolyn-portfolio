import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ReactMarkdown from 'react-markdown';
import SocialMedia from './SocialMedia';
import Loading from './Loading';
import background from './assets/background.jpg';
import Keys from './env';

class About extends React.Component {
  constructor(props) {
    super(props);

    // eslint-disable-next-line global-require
    const Contentful = require('contentful');
    this.client = Contentful.createClient(Keys);
    this.state = { loading: true };
  }

  componentWillMount() {
    const { classes } = this.props;
    document.body.className = classes.background;
  }

  componentDidMount() {
    this.client.getEntries({ content_type: 'about' }).then((res) => {
      this.setState({
        data: res.items[0],
        loading: false,
      });
    });
  }

  componentWillUnmount() {
    document.body.className = '';
  }

  render() {
    const { classes } = this.props;
    const { loading, data } = this.state;

    if (loading) {
      return <Loading color="secondary" />;
    }

    return (
      <div className={classes.container}>
        <Grid container>
          <Grid item xs={12} sm={5} md={3} className={classes.content}>
            <img
              src={data && data.fields.profilePicture.fields.file.url}
              alt="Headshot"
              className={classes.profile}
            />
            <Typography
              variant="caption"
              color="secondary"
              align="center"
            >
              {data && data.fields.location}
            </Typography>
            <Typography
              variant="caption"
              color="secondary"
              align="center"
            >
              {data && data.fields.email}
            </Typography>
            <Typography
              variant="caption"
              color="secondary"
              align="center"
            >
              {data && data.fields.phoneNumber}
            </Typography>

            <SocialMedia color="secondary" align="center" />
          </Grid>

          <Grid item xs={12} sm={7} md={9}>
            <ReactMarkdown className={classes.content}>
              {data && data.fields.bio}
            </ReactMarkdown>
          </Grid>
        </Grid>
      </div>
    );
  }
}

About.propTypes = {
  classes: PropTypes.shape({
    container: PropTypes.string,
    content: PropTypes.string,
  }).isRequired,
};

const styles = theme => ({
  container: {
    paddingTop: theme.spacing.unit * 2,
  },
  content: {
    ...theme.typography.body1,
    padding: theme.spacing.unit * 2,
    color: theme.palette.primary.contrastText,

    '& a': {
      color: theme.palette.primary.contrastText,
    },
  },
  profile: {
    boxSizing: 'border-box',
    border: `${theme.spacing.unit * 2}px solid ${theme.palette.secondary.main}`,
    width: '100%',
  },
  background: {
    backgroundImage: `url("${background}")`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
  },
});

export default withStyles(styles)(About);

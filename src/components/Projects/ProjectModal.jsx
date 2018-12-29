import React from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import Player from 'react-player';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import Zoom from '@material-ui/core/Zoom';
import detectIt from 'detect-it';

function Transition(props) {
  return <Slide direction="down" {...props} />;
}

class ModalCore extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      projectActive: false,
      labelActive: detectIt.deviceType === 'touchOnly' || false,
    };
    this.toggleProject = this.toggleProject.bind(this);
    this.toggleLabel = this.toggleLabel.bind(this);
  }

  toggleProject() {
    const { projectActive } = this.state;
    this.setState({ projectActive: !projectActive });
  }

  toggleLabel() {
    const { labelActive } = this.state;
    this.setState({ labelActive: !labelActive });
  }

  render() {
    const { classes, data } = this.props;
    const { labelActive, projectActive } = this.state;

    return (
      <div className={classes.projectContainer}>
        <div
          className={classes.photoContainer}
          role="presentation"
          onClick={this.toggleProject}
          onMouseEnter={() => this.setState({ labelActive: true })}
          onMouseLeave={() => this.setState({ labelActive: false })}
        >
          <Img
            fluid={data.coverImage.fluid}
            alt={data.coverImage.title}
            className={classes.photo}
          />
          <Zoom in={detectIt.deviceType === 'touchOnly' || labelActive}>
            <GridListTileBar
              title={data.title}
              subtitle={data.summary && data.summary.summary}
              className={classes.label}
            />
          </Zoom>
        </div>

        <Dialog
          open={projectActive}
          onClose={this.toggleProject}
          fullWidth
          TransitionComponent={Transition}
        >
          <DialogContent>
            <div className={classes.title}>
              <Typography variant="h4" color="primary" align="center">
                {data.title}
              </Typography>
              <Typography variant="h6" color="primary" align="center" gutterBottom>
                {data.role}
              </Typography>
            </div>

            {data.link
              && (
                <div className={classes.videoContainer}>
                  <Player
                    url={data.link}
                    className={classes.video}
                    controls
                    width="100%"
                    height="100%"
                  />
                </div>
              )
            }

            <div
              className={classes.markdown}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: data.description.childMarkdownRemark.html }}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

ModalCore.propTypes = {
  classes: PropTypes.shape({
    photoContainer: PropTypes.string,
    photo: PropTypes.string,
  }).isRequired,
  data: PropTypes.shape({}).isRequired,
};

const styles = theme => ({
  title: {
    marginBottom: theme.spacing.unit * 3,
  },
  photoContainer: {
    position: 'relative',
    margin: theme.spacing.unit * 5,
    cursor: 'pointer',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 'auto',
    verticalAlign: 'top', // Removes bottom gutter for Masonry
  },
  markdown: {
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.primary.main,
    '& img': {
      width: '100%',
    },
  },
  link: {
    width: '100%',
    height: 'auto',
  },
  videoContainer: {
    position: 'relative',
    paddingTop: '56.25%', // Player ratio: 100 / (1280 / 720)
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  // Breakpoints
  [`@media (min-width: ${theme.breakpoints.values.xs}px)`]: {
    projectContainer: {
      width: '100%',
    },
  },
  [`@media (min-width: ${theme.breakpoints.values.sm}px)`]: {
    projectContainer: {
      width: '50%',
    },
  },
  [`@media (min-width: ${theme.breakpoints.values.md}px)`]: {
    projectContainer: {
      width: '33.33%',
    },
  },
  [`@media (min-width: ${theme.breakpoints.values.xl}px)`]: {
    projectContainer: {
      width: '25%',
    },
  },
});

export default withStyles(styles)(ModalCore);

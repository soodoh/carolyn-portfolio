import React from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import { Link } from 'gatsby';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ArrowBack from '@material-ui/icons/ArrowBack';

const TextProject = (props) => {
  const { classes, data } = props;

  return (
    <Grid container>
      <Grid item xs={12}>
        <Button
          component={Link}
          to="projects"
          variant="outlined"
          color="secondary"
          className={classes.backButton}
        >
          <ArrowBack className={classes.backArrow} />
          Go Back
        </Button>
      </Grid>

      <Grid item xs={8} className={classes.title}>
        <Typography variant="h4" gutterBottom>
          {data.title}
        </Typography>
        <Typography variant="h6" gutterBottom>
          {data.role}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Img fluid={data.coverImage.fluid} />
      </Grid>

      <Grid item xs={12}>
        <div
          className={classes.projectContent}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: data.description.childMarkdownRemark.html }}
        />
      </Grid>
    </Grid>
  );
};

TextProject.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  data: PropTypes.shape({
    title: PropTypes.string,
    role: PropTypes.string,
    link: PropTypes.string,
    description: PropTypes.object,
    coverImage: PropTypes.object,
  }).isRequired,
};

const styles = theme => ({
  backButton: {
    marginBottom: theme.spacing.unit * 2,
  },
  backArrow: {
    marginRight: theme.spacing.unit,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  projectContent: {
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.primary.main,
    '& img': {
      width: '100%',
    },
  },
});

export default withStyles(styles)(TextProject);

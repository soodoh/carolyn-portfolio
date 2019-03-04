import React from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const TextProject = (props) => {
  const { classes, data } = props;

  return (
    <Grid container>
      <Grid item xs={12} md={6} className={classes.title}>
        <Typography variant="h2" gutterBottom>
          {data.title}
        </Typography>
        <Typography variant="subtitle1" className={classes.role} gutterBottom>
          {data.role}
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: theme.spacing.unit * 2,
  },
  role: {
    fontWeight: 'bold',
  },
  projectContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.primary.main,
    '& strong': {
      ...theme.typography.h4,
    },
    '& img': {
      width: '100%',
    },
    padding: '0',
    [`@media (min-width: ${theme.breakpoints.values.xs}px)`]: {
      padding: '0 10vw',
    },
  },
});

export default withStyles(styles)(TextProject);

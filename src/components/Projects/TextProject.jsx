import React from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import { makeStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  backButton: {
    marginBottom: theme.spacing(2),
  },
  backArrow: {
    marginRight: theme.spacing(1),
  },
  coverImage: {
    marginBottom: theme.spacing(2),
  },
  title: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
  },
  role: {
    fontWeight: 'bold',
  },
  projectContent: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.primary.main,
    padding: theme.spacing(6, 0),

    [theme.breakpoints.up('xs')]: {
      padding: `${theme.spacing(6)}px 10vw`,
    },

    '& h1, h2, h3': {
      ...theme.typography.h4,
      display: 'flex',
      justifyContent: 'center',
    },
    '& p': {
      textAlign: 'center',
    },
    '& img': {
      width: '100%',
    },
  },
}));

const TextProject = (props) => {
  const classes = useStyles();
  const { data } = props;

  return (
    <Grid container>
      <Hidden smUp>
        <Grid item xs={12} md={6} className={classes.coverImage}>
          <Img fluid={data.coverImage.fluid} />
        </Grid>
      </Hidden>

      <Grid item xs={12} md={6} className={classes.title}>
        <Typography variant="h2">
          {data.title}
        </Typography>
        <Typography variant="subtitle1" className={classes.role}>
          {data.role}
        </Typography>
      </Grid>

      <Hidden only="xs">
        <Grid item xs={12} md={6}>
          <Img fluid={data.coverImage.fluid} />
        </Grid>
      </Hidden>

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
  data: PropTypes.shape({
    title: PropTypes.string,
    role: PropTypes.string,
    link: PropTypes.string,
    description: PropTypes.object,
    coverImage: PropTypes.object,
  }).isRequired,
};

export default TextProject;

import React from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import ProjectDescription from './ProjectDescription';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    gridTemplateRows: 'repeat(auto, 3)',
    gridGap: '1em',
  },
  coverImage: {
    marginBottom: theme.spacing(2),

    [theme.breakpoints.down('sm')]: {
      gridRow: '1 / 2',
      gridColumn: '1 / 3',
    },
  },
  title: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),

    [theme.breakpoints.down('sm')]: {
      gridRow: '2 / 3',
      gridColumn: '1 / 3',
    },
  },
  pageContent: {
    gridColumn: '1 / 3',
    [theme.breakpoints.up('sm')]: {
      margin: '0 10vw',
    },
  },
  backButton: {
    marginBottom: theme.spacing(2),
  },
  backArrow: {
    marginRight: theme.spacing(1),
  },
  role: {
    fontWeight: 'bold',
  },
}));

const TextProject = (props) => {
  const classes = useStyles();
  const { data } = props;

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Typography variant="h2">
          {data.title}
        </Typography>
        <Typography variant="h6" className={classes.role}>
          {data.role}
        </Typography>
      </div>

      <Img fluid={data.coverImage.fluid} className={classes.coverImage} />

      <div className={classes.pageContent}>
        <ProjectDescription markdown={data.description.childMarkdownRemark.html} />
      </div>
    </div>
  );
};

TextProject.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string,
    role: PropTypes.string,
    link: PropTypes.string,
    description: PropTypes.shape({
      childMarkdownRemark: PropTypes.shape({
        html: PropTypes.string,
      }),
    }),
    coverImage: PropTypes.shape({
      fluid: PropTypes.shape({}),
    }),
  }).isRequired,
};

export default TextProject;

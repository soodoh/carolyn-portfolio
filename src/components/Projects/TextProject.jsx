import React from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
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
  backButton: {
    marginBottom: theme.spacing(2),
  },
  backArrow: {
    marginRight: theme.spacing(1),
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
    gridColumn: '1 / 3',

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
    <div className={classes.container}>
      <div className={classes.title}>
        <Typography variant="h2">
          {data.title}
        </Typography>
        <Typography variant="subtitle1" className={classes.role}>
          {data.role}
        </Typography>
      </div>

      <Img fluid={data.coverImage.fluid} className={classes.coverImage} />

      <div
        className={classes.projectContent}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: data.description.childMarkdownRemark.html }}
      />
    </div>
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

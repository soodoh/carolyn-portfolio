import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.primary.main,
    padding: theme.spacing(6, 0),

    '& h1, h2, h3': {
      ...theme.typography.h4,
      display: 'flex',
      justifyContent: 'center',
    },
    '& p': {
      ...theme.typography.body2,
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
    '& img': {
      width: '100%',
    },
  },
}));

const ProjectDescription = props => {
  const { markdown } = props;
  const classes = useStyles();

  return (
    <div
      className={classes.container}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: markdown }}
    />
  );
};

ProjectDescription.propTypes = {
  markdown: PropTypes.string.isRequired,
};

export default ProjectDescription;

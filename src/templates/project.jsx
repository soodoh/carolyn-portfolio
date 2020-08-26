import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import { makeStyles } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import ArrowBack from '@material-ui/icons/ArrowBack';
import VideoProject from '../components/Projects/VideoProject';
import TextProject from '../components/Projects/TextProject';
import PasswordPrompt from '../components/Projects/PasswordPrompt';

const useStyles = makeStyles(theme => ({
  topButton: {
    marginBottom: theme.spacing(4),
  },
  container: {
    padding: theme.spacing(6, 2),
    [theme.breakpoints.up('xs')]: {
      padding: `${theme.spacing(6)}px 10vw`,
    },
  },
  bottomButton: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

const Project = props => {
  const { pageContext } = props;
  const [canView, setCanView] = useState(!pageContext.password);
  const classes = useStyles();

  if (!canView) {
    return <PasswordPrompt password={pageContext.password} onSuccess={() => setCanView(true)} />;
  }
  return (
    <div className={classes.container}>
      <div className={classes.topButton}>
        <Button component={Link} to="/projects" variant="outlined" color="secondary">
          <ArrowBack />
          Go Back
        </Button>
      </div>

      {pageContext.link ? <VideoProject data={pageContext} /> : <TextProject data={pageContext} />}

      <div className={classes.bottomButton}>
        <Button component={Link} to="/projects" variant="contained" color="secondary">
          View More Work
        </Button>
      </div>
    </div>
  );
};

Project.propTypes = {
  pageContext: PropTypes.shape({
    password: PropTypes.string,
    title: PropTypes.string,
    role: PropTypes.string,
    link: PropTypes.string,
    description: PropTypes.shape({}),
    coverImage: PropTypes.shape({}),
  }).isRequired,
};

export default Project;

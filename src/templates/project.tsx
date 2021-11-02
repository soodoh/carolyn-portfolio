import React, { ReactElement, useState } from 'react';
import { Link } from 'gatsby';
import { makeStyles } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import ArrowBack from '@material-ui/icons/ArrowBack';
import VideoProject from '../components/Projects/VideoProject';
import TextProject from '../components/Projects/TextProject';
import PasswordPrompt from '../components/Projects/PasswordPrompt';
import { Project } from '../types';

const useStyles = makeStyles({
  topButton: {
    marginBottom: '3rem',
  },
  bottomButton: {
    display: 'flex',
    justifyContent: 'center',
  },
});

interface ProjectProps {
  pageContext: Project;
}

const ProjectPage = (props: ProjectProps): ReactElement => {
  const { pageContext } = props;
  const [canView, setCanView] = useState(!pageContext.password);
  const classes = useStyles();

  if (!canView) {
    return <PasswordPrompt password={pageContext.password} onSuccess={() => setCanView(true)} />;
  }
  return (
    <>
      <div className={classes.topButton}>
        <Button component={Link} to="/projects" variant="outlined" color="primary">
          <ArrowBack />
          Go Back
        </Button>
      </div>

      {pageContext.link ? <VideoProject data={pageContext} /> : <TextProject data={pageContext} />}

      <div className={classes.bottomButton}>
        <Button component={Link} to="/projects" variant="contained" color="primary">
          View More Work
        </Button>
      </div>
    </>
  );
};

export default ProjectPage;

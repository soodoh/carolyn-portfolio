import React, { ReactElement } from 'react';
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
      textAlign: 'center',
    },
    '& p': {
      ...theme.typography.body2,
      marginBottom: '1.5rem',
      textAlign: 'left',
      textIndent: '1em',
    },
    '& img': {
      width: '100%',
    },
  },
}));

interface ProjectDescriptionProps {
  markdown: string;
}

const ProjectDescription = (props: ProjectDescriptionProps): ReactElement => {
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

export default ProjectDescription;

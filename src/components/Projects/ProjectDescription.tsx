import React, { ReactElement } from 'react';
import { makeStyles } from '@material-ui/styles';
import { bodyFont, primary, headerFont } from '../Layout/theme';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: bodyFont,
    color: primary,
    padding: '3rem 0',
    [theme.breakpoints.up('sm')]: {
      margin: '0 4rem',
    },

    '& h1, h2, h3': {
      fontSize: '2.25rem',
      fontWeight: 'normal',
      margin: '1rem',
      fontFamily: headerFont,
      textAlign: 'center',
    },
    '& p': {
      fontSize: '1.25rem',
      fontFamily: bodyFont,
      marginBottom: '1.5rem',
      textAlign: 'left',
      textIndent: '2rem',
    },
    // Images are inside <p> tags, so margin should negate the textIndent
    '& p img:first-child': {
      marginLeft: '-2rem',
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

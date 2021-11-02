import React, { ReactElement } from 'react';
import Img from 'gatsby-image';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import ProjectDescription from './ProjectDescription';
import { Project } from '../../types';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    gridTemplateRows: 'repeat(auto, 3)',
    gridGap: '1rem',
  },
  coverImage: {
    marginBottom: '1rem',

    [theme.breakpoints.down('sm')]: {
      gridRow: '1 / 2',
      gridColumn: '1 / 3',
    },
  },
  title: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: '1rem',

    [theme.breakpoints.down('sm')]: {
      gridRow: '2 / 3',
      gridColumn: '1 / 3',
    },
  },
  pageContent: {
    gridColumn: '1 / 3',
    [theme.breakpoints.up('sm')]: {
      margin: '0 4rem',
    },
  },
  role: {
    fontWeight: 'bold',
  },
}));

interface TextProjectProps {
  data: Project;
}

const TextProject = (props: TextProjectProps): ReactElement => {
  const classes = useStyles();
  const { data } = props;

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Typography variant="h2">{data.title}</Typography>
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

export default TextProject;

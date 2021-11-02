import React, { ReactElement, useState } from 'react';
import { StaticQuery, graphql } from 'gatsby';
import { makeStyles } from '@material-ui/styles';
import Filters from '../common/Filters';
import ProjectsContainer from './ProjectsContainer';
import { Project } from '../../types';

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(0, 2),
  },
}));

const getCategories = (projects: Project[]) => {
  const categories = projects.reduce((acc, project) => {
    const typesToAdd = project.projectType.filter(type => !acc.includes(type));
    return [...acc, ...typesToAdd];
  }, []);
  return ['All', ...categories.sort((a, b) => a.localeCompare(b))];
};

const filteredProjects = (projects: Project[], filter: string) => {
  const currentProjects = projects;
  if (filter !== 'All') {
    return currentProjects.filter(project => project.projectType.includes(filter));
  }
  return currentProjects;
};

interface ProjectsProps {
  projects: Project[];
}

const Projects = (props: ProjectsProps): ReactElement => {
  const classes = useStyles();
  const [filter, setFilter] = useState('All');
  const { projects } = props;
  const filterList = getCategories(projects);
  const projectList = filteredProjects(projects, filter);

  return (
    <section className={classes.container}>
      <Filters list={filterList} currentItem={filter} onChange={value => setFilter(value)} />

      <ProjectsContainer data={projectList} />
    </section>
  );
};

const ProjectsWithData = (): ReactElement => (
  <StaticQuery
    query={graphql`
      query ProjectsQuery {
        allContentfulProject(sort: { fields: order, order: ASC }) {
          edges {
            node {
              id
              title
              projectType
              link
              description {
                childMarkdownRemark {
                  html
                }
              }
              summary {
                summary
              }
              coverImage {
                fluid(maxWidth: 600) {
                  ...GatsbyContentfulFluid_withWebp
                }
              }
            }
          }
        }
      }
    `}
    render={data => <Projects projects={data.allContentfulProject.edges.map((item: { node: Project }) => item.node)} />}
  />
);
export default ProjectsWithData;

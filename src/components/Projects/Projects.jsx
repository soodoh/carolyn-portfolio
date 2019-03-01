import React from 'react';
import PropTypes from 'prop-types';
import { StaticQuery, graphql } from 'gatsby';
import { withStyles } from '@material-ui/core/styles';
import Metadata from '../common/Metadata';
import Filters from '../common/Filters';
import ProjectsContainer from './ProjectsContainer';

class ProjectsCore extends React.Component {
  constructor(props) {
    super(props);

    this.state = { filter: 'All' };
    this.getCategories = this.getCategories.bind(this);
    this.filteredProjects = this.filteredProjects.bind(this);
  }

  getCategories() {
    const { projects } = this.props;
    let categories = [];

    projects.forEach((project) => {
      project.projectType.forEach((type) => {
        if (!categories.includes(type)) { categories.push(type); }
      });
    });

    categories = categories.sort((a, b) => (
      a.localeCompare(b)
    ));
    categories.unshift('All');

    return categories;
  }

  filteredProjects() {
    const { projects } = this.props;
    const { filter } = this.state;
    let currentProjects = projects;

    if (filter !== 'All') {
      currentProjects = currentProjects.filter(project => (
        project.projectType.includes(filter)
      ));
    }

    return currentProjects;
  }

  render() {
    const { classes, isComponent } = this.props;
    const { filter } = this.state;

    return (
      <React.Fragment>
        {!isComponent
          && (
            <Metadata
              title="CD Projects"
              description="View Carolyn DiLoreto's past and current projects. From film editing to UX Engineering there are many skills showcased in this section of the portfolio."
            />
          )
        }

        <section className={classes.container}>
          <Filters
            list={this.getCategories()}
            currentItem={filter}
            onChange={value => this.setState({ filter: value })}
          />

          <ProjectsContainer data={this.filteredProjects()} />
        </section>
      </React.Fragment>
    );
  }
}

ProjectsCore.propTypes = {
  classes: PropTypes.shape({
    container: PropTypes.string,
  }).isRequired,
  projects: PropTypes.arrayOf(
    PropTypes.object,
  ).isRequired,
  isComponent: PropTypes.bool,
};
ProjectsCore.defaultProps = {
  isComponent: false,
};

const styles = theme => ({
  container: {
    paddingLeft: `${theme.spacing.unit * 2}px`,
    paddingRight: `${theme.spacing.unit * 2}px`,
  },
});

const ProjectsWithStyles = withStyles(styles)(ProjectsCore);

export default () => (
  <StaticQuery
    query={graphql`
      query ProjectsQuery {
        allContentfulProject {
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
    render={data => (
      <ProjectsWithStyles
        projects={data.allContentfulProject.edges.map(item => (
          item.node
        ))}
      />
    )}
  />
);

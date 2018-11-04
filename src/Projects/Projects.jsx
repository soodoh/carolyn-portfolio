import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Filter from '../Filter';
import ViewProjects from './ViewProjects';
import Loading from '../Loading';
import Keys from '../env';

class Projects extends React.Component {
  constructor(props) {
    super(props);

    // eslint-disable-next-line global-require
    const Contentful = require('contentful');
    this.client = Contentful.createClient(Keys);

    this.state = {
      projects: [],
      filter: 'All',
      loading: true,
    };
    this.getCategories = this.getCategories.bind(this);
    this.filteredProjects = this.filteredProjects.bind(this);
  }

  componentDidMount() {
    this.client.getEntries({
      content_type: 'project',
      order: 'fields.order',
    }).then((res) => {
      this.setState({
        projects: res.items,
        loading: false,
      });
    });
  }

  getCategories() {
    const { projects } = this.state;
    let categories = [];
    projects.forEach((project) => {
      project.fields.projectType.forEach((type) => {
        if (!categories.includes(type)) { categories.push(type); }
      });
    });
    categories = categories.sort((a, b) => a > b);
    categories.unshift('All');

    return categories;
  }

  filteredProjects() {
    const { projects, filter } = this.state;
    let currentProjects = projects;

    if (filter !== 'All') {
      currentProjects = currentProjects.filter(project => (
        project.fields.projectType.includes(filter)
      ));
    }

    return currentProjects;
  }

  render() {
    const { classes } = this.props;
    const { loading, filter } = this.state;

    if (loading) {
      return <Loading />;
    }

    return (
      <section className={classes.container}>
        <Filter
          list={this.getCategories()}
          currentItem={filter}
          onChange={value => this.setState({ filter: value })}
        />

        <div>
          <ViewProjects data={this.filteredProjects()} />
        </div>
      </section>
    );
  }
}

Projects.propTypes = {
  classes: PropTypes.shape({
    container: PropTypes.string,
  }).isRequired,
};

const styles = theme => ({
  container: {
    padding: `0 ${theme.spacing.unit * 2}px`,
  },
});

export default withStyles(styles)(Projects);

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Filter from '../Filter';
import ViewProjects from './ViewProjects';
import Keys from '../temp';

class Projects extends React.Component {
	constructor(props) {
		super(props);
		
		const Contentful = require('contentful');
		this.client = Contentful.createClient(Keys);
		
		this.state = {
			projects: [],
			filter: 'All'
		};
		this.getCategories = this.getCategories.bind(this);
		this.filteredProjects = this.filteredProjects.bind(this);
	}
	
	componentDidMount() {
		this.client.getEntries({ content_type: 'project' }).then(res => {
			this.setState({ projects: res.items });
		});
	}
	
	getCategories() {
		let categories = [];
		this.state.projects.forEach(project => {
			project.fields.projectType.split(/\s/g).forEach(type => {
				let formatType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
				if(!categories.includes(formatType))
					categories.push(formatType);
			});
		});
		categories = categories.sort((a, b) => a > b);
		categories.unshift('All');
		
		return categories;
	}
	
	filteredProjects() {
		let currentProjects = this.state.projects.filter(project => project.fields.coverImage);
		
		if(this.state.filter !== 'All') {
			currentProjects = currentProjects.filter(project => {
				return project.fields.projectType.match(new RegExp(this.state.filter, 'i'));
			});
		}
		
		return currentProjects;
	}
	
	render() {
		const { classes } = this.props;
		
		return (
			<section className={classes.container}>
				<Filter list={this.getCategories()}
				        currentItem={this.state.filter}
				        onChange={value => this.setState({ filter: value })}
				/>
				
				<div className={classes.content}>
					<ViewProjects data={this.filteredProjects()} />
				</div>
			</section>
		);
	}
}

const styles = theme => ({
	container: {
		padding: `0 ${theme.spacing.unit * 2}px`
	},
	content: {
		paddingTop: theme.spacing.unit * 5 // Filter bar's height
	}
});

export default withStyles(styles)(Projects);
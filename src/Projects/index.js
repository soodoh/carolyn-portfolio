import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Filter from '../Filter';
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
	
	render() {
		const { classes } = this.props;
		
		return (
			<section className={classes.container}>
				<Filter list={this.getCategories()}
				        currentItem={this.state.filter}
				        onChange={value => this.setState({ filter: value })}
				/>
				
				<div className={classes.content}>
					Test
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
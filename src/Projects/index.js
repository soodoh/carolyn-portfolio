import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Filter from '../Filter';

class Projects extends React.Component {
	constructor(props) {
		super(props);
		
		const Contentful = require('contentful');
		this.client = Contentful.createClient({
		});
		
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
		return (
			<section>
				<Filter list={this.getCategories()}
				        currentItem={this.state.filter}
				        onChange={value => this.setState({ filter: value })}
				/>
			</section>
		);
	}
}

const styles = {

};

export default withStyles(styles)(Projects);
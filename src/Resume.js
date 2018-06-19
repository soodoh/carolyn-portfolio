import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Keys from "./keys";

class Resume extends React.Component {
	constructor(props) {
		super(props);
		
		const Contentful = require('contentful');
		this.client = Contentful.createClient(Keys);
		this.state = {};
	}
	
	componentDidMount() {
		this.client.getEntries({ content_type: 'about' }).then(res => {
			this.setState({ resume: res.items[0].fields.resume.fields.file.url });
		});
	}
	
	render() {
		const { classes } = this.props;
		
		return (
			<div>
				<object data={this.state.resume}
				        type='application/pdf'
				        className={classes.resume}
				>
					<a href={this.state.resume}>CD_Resume.pdf</a>
				</object>
			</div>
		);
	}
}

const styles = theme => ({
	resume: {
		width: '100%',
		height: `calc(100vh - ${theme.spacing.unit * 20}px)`
	}
});

export default withStyles(styles)(Resume);
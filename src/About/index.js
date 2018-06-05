import React from 'react';
import background from '../assets/background.jpg';
import { withStyles } from '@material-ui/core/styles';

class About extends React.Component {
	componentWillMount() {
		document.body.className = this.props.classes.background;
	}
	
	componentWillUnmount() {
		document.body.className = '';
	}
	
	render() {
		return (
			<div>This is the about page</div>
		);
	}
}

const styles = {
	background : {
		backgroundImage: `url("${background}")`,
		backgroundPosition: 'center',
		backgroundSize: 'cover',
		backgroundAttachment: 'fixed'
	}
};

export default withStyles(styles)(About);
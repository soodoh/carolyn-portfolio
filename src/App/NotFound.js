import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const NotFound = props => (
	<div className={props.classes.container}>
		<Typography variant='display1' gutterBottom>
			404: Page Not Found
		</Typography>
		<Typography variant='title'>
			Please check your URL, or select something from the nav bar
		</Typography>
	</div>
);

const styles = theme => ({
	container: {
		padding: theme.spacing.unit * 2
	}
});

export default withStyles(styles)(NotFound);
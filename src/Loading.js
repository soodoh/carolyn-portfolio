import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';

const Loading = props => {
	const { classes } = props;
	
	return (
		<div className={classes.container}>
			<CircularProgress color='primary' thickness={8} size={75} />
		</div>
	);
};

const styles = {
	container: {
	
	}
};

export default withStyles(styles)(Loading);
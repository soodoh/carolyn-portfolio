import React from 'react';
import Typography from '@material-ui/core/Typography';

const NotFound = props => (
	<div>
		<Typography variant='display1' gutterBottom>
			404: Page Not Found
		</Typography>
		<Typography variant='title'>
			Please check your URL, or select something from the nav bar
		</Typography>
	</div>
);

export default NotFound;
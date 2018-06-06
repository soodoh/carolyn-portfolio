import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import resume from './assets/resume.pdf';

const Resume = props => (
	<div>
		<object data={resume}
		        type='application/pdf'
		        className={props.classes.resume}
		>
			<a href={resume}>CD_Resume.pdf</a>
		</object>
	</div>
);

const styles = {
	resume: {
		width: '100%',
		height: '100vh'
	}
};

export default withStyles(styles)(Resume);
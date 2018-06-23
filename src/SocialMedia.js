import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Instagram from 'mdi-material-ui/Instagram';
import LinkedIn from 'mdi-material-ui/LinkedinBox';

const SocialMedia = props => (
	<div className={props.classes.container}>
		<a href='https://www.instagram.com/carodilophotography/' className={props.classes.link}>
			<IconButton color={props.color || 'inherit'}>
				<Instagram />
			</IconButton>
		</a>
		
		<a href='https://www.linkedin.com/in/cdiloreto/' className={props.classes.link}>
			<IconButton color={props.color || 'inherit'}>
				<LinkedIn />
			</IconButton>
		</a>
	</div>
);

const styles = {
	container: {
		display: 'flex',
		justifyContent: 'center'
	},
	link: {
		color: 'inherit'
	}
};

export default withStyles(styles)(SocialMedia);
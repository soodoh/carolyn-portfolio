import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Instagram from 'mdi-material-ui/Instagram';
import LinkedIn from 'mdi-material-ui/LinkedinBox';

const SocialMedia = props => (
	<div>
		<IconButton color='inherit'>
			<Instagram />
		</IconButton>
		<IconButton color='inherit'>
			<LinkedIn />
		</IconButton>
	</div>
);

export default SocialMedia;
import React from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Instagram from 'mdi-material-ui/Instagram';
import LinkedIn from 'mdi-material-ui/LinkedinBox';
import { withStyles } from '@material-ui/core/styles';

// TODO add links to icon buttons

const Footer = props => {
	const { classes } = props;
	
	return (
		<footer className={classes.footer}>
			<section className={classes.content}>
				<div>
					<Typography variant='caption'>
						Copyright &copy; {new Date().getFullYear()} Carolyn DiLoreto
					</Typography>
					<Typography variant='caption'>
						Designed by Carolyn DiLoreto
					</Typography>
					<Typography variant='caption'>
						Developed by Paul DiLoreto
					</Typography>
				</div>
				
				<div>
					<IconButton>
						<Instagram />
					</IconButton>
					<IconButton>
						<LinkedIn />
					</IconButton>
				</div>
			</section>
		</footer>
	);
};

const styles = theme => ({
	footer: {
		width: '100vw',
		height: theme.spacing.unit * 11,
		position: 'absolute',
		bottom: 0,
		display: 'flex'
	},
	content: {
		display: 'flex',
		flex: 1,
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: `0 ${theme.spacing.unit * 2}px`
	}
});

export default withStyles(styles)(Footer);